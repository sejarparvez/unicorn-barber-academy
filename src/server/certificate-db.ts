// src/server/certificate-db.ts
// Certificate data access: issuance from completed+paid applications,
// public code lookup for /verify, student listings, revocation.
// Codes are public-facing (UBT-YYYY-NNNN) — they appear in QR codes and
// employer verification checks, so uniqueness is enforced with retries
// against the DB constraint rather than trusting count-based sequences.

import type { CertificateRecord } from "@/lib/certificates";
import type { Cohort } from "@/lib/enrollment";
import { db, withTransaction } from "./db";
import { PG_UNIQUE_VIOLATION } from "./pg-codes";
import { programTitle } from "./program-utils";

type CertificateRow = {
	id: number;
	code: string;
	user_id: number;
	holder_name: string | null;
	program_slug: string;
	cohort: string;
	issued_on: Date;
	issued_by: number | null;
	revoked_at: Date | null;
	revoked_by: number | null;
	revoked_reason: string | null;
};

function rowToRecord(row: CertificateRow): CertificateRecord {
	return {
		id: row.id,
		code: row.code,
		userId: row.user_id,
		holderName: row.holder_name ?? "Graduate",
		programSlug: row.program_slug,
		programTitle: programTitle(row.program_slug),
		cohort: row.cohort as Cohort,
		issuedOn: new Date(row.issued_on).toISOString().slice(0, 10),
		issuedBy: row.issued_by,
		revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : null,
		revokedBy: row.revoked_by,
		revokedReason: row.revoked_reason,
	};
}

const SELECT_COLUMNS = `c.id, c.code, c.user_id, u.name AS holder_name,
	c.program_slug, c.cohort, c.issued_on, c.issued_by, c.revoked_at, c.revoked_by, c.revoked_reason`;

/* ------------------------------- issuance -------------------------------- */

export type IssueResult =
	| { ok: true; code: string }
	| {
			ok: false;
			reason: "not-found" | "not-completed" | "fee-unpaid" | "already-issued";
	  };

/**
 * Mint a certificate for an application. Eligibility is enforced here —
 * not in the route — so every caller (API, future bulk tool) inherits it:
 * the application must be 'completed' with the registration fee paid, and
 * must not already have a certificate.
 */
export async function issueCertificateForApplication(
	applicationId: number,
	adminUserId: number,
): Promise<IssueResult> {
	return withTransaction<IssueResult>(async (tx) => {
		const appRes = await tx.query<{
			id: number;
			user_id: number;
			status: string;
			fee_status: string;
			program_slug: string;
			cohort: string;
		}>(
			`SELECT a.id, a.user_id, a.status, a.fee_status, i.program_slug, i.cohort
			 FROM enrollment_application a
			 JOIN program_intake i ON i.id = a.intake_id
			 WHERE a.id = $1
			 FOR UPDATE OF a`,
			[applicationId],
		);
		const app = appRes.rows[0];
		if (!app) return { ok: false, reason: "not-found" };
		if (app.status !== "completed") {
			return { ok: false, reason: "not-completed" };
		}
		if (app.fee_status !== "paid") return { ok: false, reason: "fee-unpaid" };

		const existing = await tx.query<{ code: string }>(
			"SELECT code FROM certificate WHERE application_id = $1",
			[applicationId],
		);
		if (existing.rows[0]) {
			return { ok: false, reason: "already-issued" };
		}

		// Per-year sequence: UBT-YYYY-NNNN, padded to four digits. Derived
		// from max(serial), not count(*): deletions must not create gaps that
		// collide with live codes.
		const year = new Date().getFullYear();
		const seqRes = await tx.query<{ n: number }>(
			`SELECT COALESCE(max(split_part(code, '-', 3)::int), 0) AS n
			 FROM certificate
			 WHERE code LIKE $1`,
			[`UBT-${year}-%`],
		);

		for (let attempt = 0; attempt < 5; attempt++) {
			const serial = (seqRes.rows[0]?.n ?? 0) + 1 + attempt;
			const code = `UBT-${year}-${String(serial).padStart(4, "0")}`;
			try {
				const insertRes = await tx.query<{ code: string }>(
					`INSERT INTO certificate (code, user_id, application_id, program_slug, cohort, issued_by)
					 VALUES ($1, $2, $3, $4, $5, $6)
					 RETURNING code`,
					[
						code,
						app.user_id,
						applicationId,
						app.program_slug,
						app.cohort,
						adminUserId,
					],
				);
				return { ok: true, code: insertRes.rows[0].code };
			} catch (error) {
				if ((error as { code?: string }).code !== PG_UNIQUE_VIOLATION) {
					throw error;
				}
				// Serial raced with a concurrent issuance — try the next one.
			}
		}
		throw new Error(
			`certificate code generation failed after retries (admin ${adminUserId}, application ${applicationId})`,
		);
	});
}

export async function setCertificateRevocation(options: {
	id: number;
	revoked: boolean;
	reason: string | null;
	revokedBy: number | null;
}): Promise<boolean> {
	const res = await db().query(
		`UPDATE certificate SET
			revoked_at = CASE WHEN $2 THEN now() ELSE NULL END,
			revoked_reason = CASE WHEN $2 THEN $3 ELSE NULL END,
			revoked_by = CASE WHEN $2 THEN $4 ELSE NULL END
		 WHERE id = $1`,
		[
			options.id,
			options.revoked,
			options.reason?.slice(0, 500),
			options.revokedBy,
		],
	);
	return (res.rowCount ?? 0) > 0;
}

/* -------------------------------- reads ---------------------------------- */

/** Public verification lookup by code (used by /verify/<code>). */
export async function getCertificateByCode(
	code: string,
): Promise<CertificateRecord | null> {
	const res = await db().query<CertificateRow>(
		`SELECT ${SELECT_COLUMNS}
		 FROM certificate c JOIN "user" u ON u.id = c.user_id
		 WHERE c.code = $1 LIMIT 1`,
		[code],
	);
	return res.rows[0] ? rowToRecord(res.rows[0]) : null;
}

export async function listCertificatesForUser(
	userId: number,
): Promise<CertificateRecord[]> {
	const res = await db().query<CertificateRow>(
		`SELECT ${SELECT_COLUMNS}
		 FROM certificate c JOIN "user" u ON u.id = c.user_id
		 WHERE c.user_id = $1
		 ORDER BY c.issued_on DESC, c.id DESC`,
		[userId],
	);
	return res.rows.map(rowToRecord);
}

/** Ownership-checked single fetch (print page). */
export async function getCertificateForUser(
	id: number,
	userId: number,
): Promise<CertificateRecord | null> {
	const res = await db().query<CertificateRow>(
		`SELECT ${SELECT_COLUMNS}
		 FROM certificate c JOIN "user" u ON u.id = c.user_id
		 WHERE c.id = $1 AND c.user_id = $2 LIMIT 1`,
		[id, userId],
	);
	return res.rows[0] ? rowToRecord(res.rows[0]) : null;
}

/** Admin view: the certificate minted from a given application, if any. */
export async function getCertificateByApplicationId(
	applicationId: number,
): Promise<CertificateRecord | null> {
	const res = await db().query<CertificateRow>(
		`SELECT ${SELECT_COLUMNS}
		 FROM certificate c JOIN "user" u ON u.id = c.user_id
		 WHERE c.application_id = $1 LIMIT 1`,
		[applicationId],
	);
	return res.rows[0] ? rowToRecord(res.rows[0]) : null;
}

export async function countCertificates(): Promise<number> {
	const res = await db().query<{ n: number }>(
		"SELECT count(*)::int AS n FROM certificate",
	);
	return res.rows[0]?.n ?? 0;
}

export async function countActiveCertificates(): Promise<number> {
	const res = await db().query<{ n: number }>(
		"SELECT count(*)::int AS n FROM certificate WHERE revoked_at IS NULL",
	);
	return res.rows[0]?.n ?? 0;
}
