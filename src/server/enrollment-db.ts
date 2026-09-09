// src/server/enrollment-db.ts
// Server-only data access for the enrollment system (see
// scripts/sql/003_enrollment.sql). All seat-integrity logic lives here:
// submissions take a row lock on the intake before recounting occupancy, so
// two simultaneous applicants can never both claim the last seat.
//
// Program titles come from src/data/programs.ts — the catalog stays
// single-sourced in code; intakes only reference slugs.

import { ALL_PROGRAMS } from "@/data/programs";
import { toDateOnly } from "@/lib/date";
import type {
	ApplicationStatus,
	ApplicationSummary,
	Cohort,
	FeeStatus,
	IntakeAdmin,
	IntakePublic,
	MyApplication,
} from "@/lib/enrollment";
import {
	generateReference,
	parseApplicationStatus,
	parseCohort,
	parseFeeMethod,
	parseFeeStatus,
} from "@/lib/enrollment";
import { db, withTransaction } from "./db";
import { escapeLike } from "./fn-utils";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "./pg-codes";
import { programTitle } from "./program-utils";

/** Allowed status transitions. A key maps from the current status to the set of statuses it can move to. */
const VALID_TRANSITIONS: Record<
	ApplicationStatus,
	readonly ApplicationStatus[]
> = {
	pending: ["reviewing", "approved", "waitlisted", "rejected"],
	reviewing: ["approved", "waitlisted", "rejected"],
	approved: ["completed", "rejected"],
	waitlisted: ["approved", "rejected"],
	rejected: [],
	completed: [],
};

/* ------------------------------- public --------------------------------- */

/** Open intakes for the application form — including full ones (the form
    shows "Full" state instead of hiding capacity reality). Past intakes are
    hidden entirely. */
export async function listOpenIntakes(): Promise<IntakePublic[]> {
	const res = await db().query<{
		id: number;
		program_slug: string;
		cohort: string;
		starts_on: Date;
		seats_total: number;
		seats_left: number;
		fee_poisha: number | null;
		is_published: boolean | null;
	}>(
		`SELECT i.id, i.program_slug, i.cohort, i.starts_on, i.seats_total,
			i.seats_total - (
				SELECT count(*) FROM enrollment_application a
				WHERE a.intake_id = i.id
				  AND a.status IN ('pending', 'reviewing', 'approved')
			)::int AS seats_left,
			p.fee_poisha, p.is_published
		 FROM program_intake i
		 LEFT JOIN program p ON p.slug = i.program_slug
		 WHERE i.is_open = TRUE AND i.starts_on >= CURRENT_DATE
		 ORDER BY i.starts_on ASC, i.cohort ASC`,
	);
	const out: IntakePublic[] = [];
	for (const row of res.rows) {
		// Hidden or unknown programs never surface on the apply form.
		if (row.is_published !== true) continue;
		const title = programTitle(row.program_slug);
		if (!title) continue; // stale slug — never surface it
		const track = ALL_PROGRAMS.find((p) => p.slug === row.program_slug)?.track;
		if (!track) continue;
		out.push({
			id: row.id,
			programSlug: row.program_slug,
			programTitle: title,
			track,
			cohort: parseCohort(row.cohort) ?? "day",
			startsOn: toDateOnly(row.starts_on),
			seatsTotal: row.seats_total,
			seatsLeft: Math.max(0, row.seats_left),
			feePoisha: row.fee_poisha ?? 0,
		});
	}
	return out;
}

export type SubmitResult =
	| { ok: true; reference: string }
	| { ok: false; reason: "full" | "closed" | "duplicate" | "past" };

/**
 * Submits an application atomically:
 *   1. lock the intake row (FOR UPDATE),
 *   2. recount occupancy under the lock,
 *   3. reject duplicates (same applicant, same intake, still active),
 *   4. INSERT with a collision-checked ENR reference.
 */
export async function submitApplication(input: {
	userId: number;
	intakeId: number;
	fullName: string;
	email: string;
	phone: string;
	experienceNote: string | null;
	hearAbout: string | null;
}): Promise<SubmitResult> {
	return withTransaction<SubmitResult>(async (tx) => {
		const intakeRes = await tx.query<{
			id: number;
			is_open: boolean;
			seats_total: number;
			starts_on: Date;
			seats_left: number;
		}>(
			`SELECT id, is_open, seats_total, starts_on,
				seats_total - (
					SELECT count(*) FROM enrollment_application a
					WHERE a.intake_id = i.id
					  AND a.status IN ('pending','reviewing','approved')
				)::int AS seats_left
			 FROM program_intake i WHERE i.id = $1 FOR UPDATE`,
			[input.intakeId],
		);
		const intake = intakeRes.rows[0];
		if (!intake) return { ok: false, reason: "closed" };
		if (!intake.is_open) return { ok: false, reason: "closed" };
		if (new Date(intake.starts_on) < startOfToday()) {
			return { ok: false, reason: "past" };
		}

		const dupRes = await tx.query<{ id: number }>(
			`SELECT id FROM enrollment_application
			 WHERE user_id = $1 AND intake_id = $2 AND status <> 'rejected'
			 LIMIT 1`,
			[input.userId, input.intakeId],
		);
		if (dupRes.rows.length > 0) return { ok: false, reason: "duplicate" };

		if (intake.seats_left <= 0) return { ok: false, reason: "full" };

		// Collision-checked reference (alphabet omits I/L/O/0/1).
		for (let attempt = 0; attempt < 5; attempt++) {
			try {
				const reference = generateReference();
				await tx.query(
					`INSERT INTO enrollment_application
						(reference, user_id, intake_id, status, full_name, email, phone,
						 experience_note, hear_about)
					 VALUES ($1,$2,$3,'pending',$4,$5,$6,$7,$8)`,
					[
						reference,
						input.userId,
						input.intakeId,
						input.fullName,
						input.email,
						input.phone,
						input.experienceNote,
						input.hearAbout,
					],
				);
				return { ok: true, reference };
			} catch (error) {
				if ((error as { code?: string }).code !== PG_UNIQUE_VIOLATION) {
					throw error;
				}
			}
		}
		return { ok: false, reason: "closed" }; // unreachable in practice
	});
}

function startOfToday(): Date {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** The signed-in applicant's own applications, newest first. */
export async function listMyApplications(
	userId: number,
): Promise<MyApplication[]> {
	const res = await db().query<{
		id: number;
		reference: string;
		status: string;
		fee_status: string;
		program_slug: string;
		cohort: string;
		starts_on: Date;
		created_at: Date;
	}>(
		`SELECT a.id, a.reference, a.status, a.fee_status,
			i.program_slug, i.cohort, i.starts_on, a.created_at
		 FROM enrollment_application a
		 JOIN program_intake i ON i.id = a.intake_id
		 WHERE a.user_id = $1
		 ORDER BY a.created_at DESC`,
		[userId],
	);
	return res.rows.flatMap((row) => {
		const title = programTitle(row.program_slug);
		if (!title) return [];
		return [
			{
				id: row.id,
				reference: row.reference,
				status: parseApplicationStatus(row.status) ?? "pending",
				feeStatus: parseFeeStatus(row.fee_status) ?? "unpaid",
				programTitle: title,
				programSlug: row.program_slug,
				cohort: parseCohort(row.cohort) ?? "day",
				startsOn: toDateOnly(row.starts_on),
				submittedAt: new Date(row.created_at).toISOString(),
			},
		];
	});
}

/* -------------------------------- admin --------------------------------- */

export async function listApplicationsAdmin(options: {
	status?: ApplicationStatus;
	search?: string;
	programSlug?: string;
	cohort?: Cohort;
	feeStatus?: FeeStatus;
	page?: number;
	perPage?: number;
}): Promise<{
	items: ApplicationSummary[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
}> {
	const page = Math.max(1, options.page ?? 1);
	const perPage = Math.min(50, Math.max(1, options.perPage ?? 20));

	const conditions: string[] = [];
	const countParams: unknown[] = [];
	if (options.status) {
		countParams.push(options.status);
		conditions.push(`a.status = $${countParams.length}`);
	}
	if (options.search?.trim()) {
		countParams.push(`%${escapeLike(options.search.trim())}%`);
		const n = countParams.length;
		conditions.push(
			`(a.reference ILIKE $${n} OR a.full_name ILIKE $${n} OR a.email ILIKE $${n} OR a.phone ILIKE $${n})`,
		);
	}
	if (options.programSlug) {
		countParams.push(options.programSlug);
		conditions.push(`i.program_slug = $${countParams.length}`);
	}
	if (options.cohort) {
		countParams.push(options.cohort);
		conditions.push(`i.cohort = $${countParams.length}`);
	}
	if (options.feeStatus) {
		countParams.push(options.feeStatus);
		conditions.push(`a.fee_status = $${countParams.length}`);
	}
	const where =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const totalRes = await db().query<{ count: string }>(
		`SELECT count(*)::text AS count FROM enrollment_application a ${where}`,
		countParams,
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	const res = await db().query<{
		id: number;
		reference: string;
		status: string;
		fee_status: string;
		full_name: string;
		email: string;
		phone: string;
		program_slug: string;
		cohort: string;
		starts_on: Date;
		user_id: number;
		user_role: string | null;
		created_at: Date;
	}>(
		`SELECT a.id, a.reference, a.status, a.fee_status, a.full_name, a.email,
			a.phone, i.program_slug, i.cohort, i.starts_on, a.user_id, u.role AS user_role,
			a.created_at
		 FROM enrollment_application a
		 JOIN program_intake i ON i.id = a.intake_id
		 JOIN "user" u ON u.id = a.user_id
		 ${where}
		 ORDER BY a.created_at DESC
		 LIMIT $${countParams.length + 1} OFFSET $${countParams.length + 2}`,
		[...countParams, perPage, (page - 1) * perPage],
	);

	return {
		items: res.rows.flatMap((row) => {
			const title = programTitle(row.program_slug);
			if (!title) return [];
			return [
				{
					id: row.id,
					reference: row.reference,
					status: parseApplicationStatus(row.status) ?? "pending",
					feeStatus: parseFeeStatus(row.fee_status) ?? "unpaid",
					fullName: row.full_name,
					email: row.email,
					phone: row.phone,
					programTitle: title,
					programSlug: row.program_slug,
					cohort: parseCohort(row.cohort) ?? "day",
					startsOn: toDateOnly(row.starts_on),
					userId: row.user_id,
					userRole: row.user_role,
					submittedAt: new Date(row.created_at).toISOString(),
				},
			];
		}),
		total,
		page,
		perPage,
		totalPages,
	};
}

export async function getApplicationDetail(id: number) {
	const res = await db().query<{
		id: number;
		reference: string;
		status: string;
		fee_status: string;
		full_name: string;
		email: string;
		phone: string;
		experience_note: string | null;
		hear_about: string | null;
		decided_at: Date | null;
		decision_note: string | null;
		user_id: number;
		user_role: string | null;
		created_at: Date;
		updated_at: Date;
		intake_id: number;
		program_slug: string;
		cohort: string;
		starts_on: Date;
		intake_open: boolean;
		seats_total: number;
		seats_occupied: number;
		program_fee: number;
		fee_paid: number;
	}>(
		`SELECT a.id, a.reference, a.status, a.fee_status, a.full_name, a.email,
			a.phone, a.experience_note, a.hear_about, a.decided_at, a.decision_note,
			a.user_id, u.role AS user_role, a.created_at, a.updated_at,
			i.id AS intake_id, i.program_slug, i.cohort, i.starts_on,
			i.is_open AS intake_open, i.seats_total,
			(SELECT count(*) FROM enrollment_application x
			 WHERE x.intake_id = i.id
			   AND x.status IN ('pending','reviewing','approved'))::int AS seats_occupied,
			coalesce((SELECT p.fee_poisha FROM program p WHERE p.slug = i.program_slug), 0)::int AS program_fee,
			coalesce((SELECT sum(f.amount_poisha) FROM fee_payment f WHERE f.application_id = a.id), 0)::int AS fee_paid
		 FROM enrollment_application a
		 JOIN program_intake i ON i.id = a.intake_id
		 JOIN "user" u ON u.id = a.user_id
		 WHERE a.id = $1`,
		[id],
	);
	const row = res.rows[0];
	if (!row) return null;
	const title = programTitle(row.program_slug);
	if (!title) return null;
	const payments = await listFeePayments(row.id);

	return {
		application: {
			id: row.id,
			reference: row.reference,
			status: parseApplicationStatus(row.status) ?? "pending",
			feeStatus: parseFeeStatus(row.fee_status) ?? "unpaid",
			fullName: row.full_name,
			email: row.email,
			phone: row.phone,
			programTitle: title,
			programSlug: row.program_slug,
			cohort: parseCohort(row.cohort) ?? "day",
			startsOn: toDateOnly(row.starts_on),
			userId: row.user_id,
			userRole: row.user_role,
			submittedAt: new Date(row.created_at).toISOString(),
			experienceNote: row.experience_note,
			hearAbout: row.hear_about,
			decidedAt: row.decided_at ? new Date(row.decided_at).toISOString() : null,
			decisionNote: row.decision_note,
			intakeId: row.intake_id,
			intakeOpen: row.intake_open,
			seatsTotal: row.seats_total,
			seatsOccupied: row.seats_occupied,
			updatedAt: new Date(row.updated_at).toISOString(),
			programFeePoisha: row.program_fee,
			feePaidPoisha: row.fee_paid,
			payments,
		},
	};
}

export type StatusUpdateResult =
	| {
			ok: true;
			emailKind: "approved" | "waitlisted" | "rejected" | null;
			userRoleUpgraded: boolean;
	  }
	| { ok: false; reason: "not-found" | "invalid-transition" };

export type StatusLogEntry = {
	id: number;
	applicationId: number;
	adminUserId: number;
	adminName: string | null;
	fromStatus: string | null;
	toStatus: string;
	note: string | null;
	createdAt: string;
};

/** Audit trail for one application, newest first. */
export async function listApplicationStatusLog(
	applicationId: number,
): Promise<StatusLogEntry[]> {
	const res = await db().query<{
		id: number;
		application_id: number;
		admin_user_id: number;
		admin_name: string | null;
		from_status: string | null;
		to_status: string;
		note: string | null;
		created_at: Date;
	}>(
		`SELECT l.id, l.application_id, l.admin_user_id, u.name AS admin_name,
			l.from_status, l.to_status, l.note, l.created_at
		 FROM application_status_log l
		 LEFT JOIN "user" u ON u.id = l.admin_user_id
		 WHERE l.application_id = $1
		 ORDER BY l.created_at DESC`,
		[applicationId],
	);
	return res.rows.map((row) => ({
		id: row.id,
		applicationId: row.application_id,
		adminUserId: row.admin_user_id,
		adminName: row.admin_name,
		fromStatus: row.from_status,
		toStatus: row.to_status,
		note: row.note,
		createdAt: new Date(row.created_at).toISOString(),
	}));
}

/**
 * Status transition with side effects, all in one transaction:
 *   * stamps decided_at/by on first terminal decision,
 *   * upgrades the applicant's academy role 'user' → 'student' on approval
 *     (never touches instructor/admin roles).
 */
export async function updateApplicationStatus(options: {
	id: number;
	status: ApplicationStatus;
	adminUserId: number;
	note: string | null;
}): Promise<StatusUpdateResult> {
	const TERMINAL: readonly ApplicationStatus[] = [
		"approved",
		"waitlisted",
		"rejected",
		"completed",
	];

	return withTransaction(async (tx) => {
		const currentRes = await tx.query<{
			user_id: number;
			status: string;
			role: string | null;
			decided_at: Date | null;
		}>(
			`SELECT a.user_id, a.status, u.role, a.decided_at
			 FROM enrollment_application a
			 JOIN "user" u ON u.id = a.user_id
			 WHERE a.id = $1
			 FOR UPDATE OF a`,
			[options.id],
		);
		const current = currentRes.rows[0];
		if (!current) return { ok: false as const, reason: "not-found" as const };

		// Validate the status transition.
		const currentStatus = parseApplicationStatus(current.status);
		if (!currentStatus)
			return { ok: false as const, reason: "invalid-transition" as const };
		const allowed = VALID_TRANSITIONS[currentStatus];
		if (!allowed || !allowed.includes(options.status)) {
			return {
				ok: false as const,
				reason: "invalid-transition" as const,
			};
		}

		const firstDecision =
			TERMINAL.includes(options.status) && !current.decided_at;

		await tx.query(
			`UPDATE enrollment_application SET
				status = $2,
				decided_at = CASE WHEN $5 THEN now() ELSE decided_at END,
				decided_by = CASE WHEN $5 THEN $3 ELSE decided_by END,
				decision_note = COALESCE($4, decision_note),
				updated_at = now()
			 WHERE id = $1`,
			[
				options.id,
				options.status,
				options.adminUserId,
				options.note,
				firstDecision,
			],
		);

		// Audit trail: record who changed what and when.
		await tx.query(
			`INSERT INTO application_status_log
				(application_id, admin_user_id, from_status, to_status, note)
			 VALUES ($1, $2, $3, $4, $5)`,
			[
				options.id,
				options.adminUserId,
				current.status,
				options.status,
				options.note,
			],
		);

		let userRoleUpgraded = false;
		if (options.status === "approved" && current.role === "user") {
			await tx.query(
				`UPDATE "user" SET role = 'student', "updatedAt" = now() WHERE id = $1 AND role = 'user'`,
				[current.user_id],
			);
			userRoleUpgraded = true;
		}

		// 'completed' is terminal but silent — the graduation itself is
		// communicated by issuing a certificate, not a form email.
		const emailKind =
			options.status === "approved" ||
			options.status === "waitlisted" ||
			options.status === "rejected"
				? options.status
				: null;

		return { ok: true as const, emailKind, userRoleUpgraded };
	});
}

/* ------------------------------ fee ledger ------------------------------ */

export type FeeRecordResult =
	| { ok: true; id?: number }
	| { ok: false; reason: "not-found" | "invalid" };

/**
 * Recompute fee_status from the ledger: paid in full when Σ payments ≥ the
 * intake program's fee. Called after every ledger write so the flag (and
 * everything downstream — certificate gate, badges) stays truthful.
 */
async function recomputeFeeStatus(applicationId: number): Promise<void> {
	await db().query(
		`UPDATE enrollment_application a SET
			fee_status = CASE
				WHEN coalesce((
					SELECT sum(f.amount_poisha) FROM fee_payment f
					WHERE f.application_id = a.id
				), 0) >= coalesce((
					SELECT p.fee_poisha FROM program_intake i
					JOIN program p ON p.slug = i.program_slug
					WHERE i.id = a.intake_id
				), 0) THEN 'paid' ELSE 'unpaid' END,
			fee_paid_at = CASE
				WHEN coalesce((
					SELECT sum(f.amount_poisha) FROM fee_payment f
					WHERE f.application_id = a.id
				), 0) >= coalesce((
					SELECT p.fee_poisha FROM program_intake i
					JOIN program p ON p.slug = i.program_slug
					WHERE i.id = a.intake_id
				), 0) THEN coalesce(fee_paid_at, now()) ELSE NULL END,
			updated_at = now()
		 WHERE a.id = $1`,
		[applicationId],
	);
}

export async function recordFeePayment(input: {
	applicationId: number;
	amountPoisha: number;
	method: string;
	receiptRef: string | null;
	receivedBy: number | null;
	paidAt: string | null;
}): Promise<FeeRecordResult> {
	if (!Number.isInteger(input.amountPoisha) || input.amountPoisha <= 0) {
		return { ok: false, reason: "invalid" };
	}
	const app = await db().query<{ one: number }>(
		"SELECT 1 AS one FROM enrollment_application WHERE id = $1",
		[input.applicationId],
	);
	if (app.rows.length === 0) return { ok: false, reason: "not-found" };
	const res = await db().query<{ id: number }>(
		`INSERT INTO fee_payment
			(application_id, amount_poisha, method, receipt_ref, received_by, paid_at)
		 VALUES ($1,$2,$3,$4,$5,coalesce($6::timestamptz, now()))
		 RETURNING id`,
		[
			input.applicationId,
			input.amountPoisha,
			input.method,
			input.receiptRef,
			input.receivedBy,
			input.paidAt,
		],
	);
	await recomputeFeeStatus(input.applicationId);
	return { ok: true, id: res.rows[0]?.id };
}

export async function deleteFeePayment(
	applicationId: number,
	paymentId: number,
): Promise<boolean> {
	const res = await db().query(
		"DELETE FROM fee_payment WHERE id = $1 AND application_id = $2",
		[paymentId, applicationId],
	);
	if ((res.rowCount ?? 0) === 0) return false;
	await recomputeFeeStatus(applicationId);
	return true;
}

export async function listFeePayments(
	applicationId: number,
): Promise<import("@/lib/enrollment").FeePaymentRow[]> {
	const res = await db().query<{
		id: number;
		amount_poisha: number;
		method: string;
		receipt_ref: string | null;
		receiver_name: string | null;
		paid_at: Date;
	}>(
		`SELECT f.id, f.amount_poisha, f.method, f.receipt_ref,
			u.name AS receiver_name, f.paid_at
		 FROM fee_payment f
		 LEFT JOIN "user" u ON u.id = f.received_by
		 WHERE f.application_id = $1
		 ORDER BY f.paid_at DESC, f.id DESC`,
		[applicationId],
	);
	return res.rows.map((row) => ({
		id: row.id,
		amountPoisha: row.amount_poisha,
		method: parseFeeMethod(row.method) ?? "cash",
		receiptRef: row.receipt_ref,
		receivedByName: row.receiver_name,
		paidAt: new Date(row.paid_at).toISOString(),
	}));
}

/** Batch status update for the bulk action bar. Runs each transition
 * individually (they have side effects: role upgrades, emails) and
 * returns per-application results. Max 50 IDs per call. */
export async function bulkUpdateApplicationStatus(options: {
	ids: number[];
	status: ApplicationStatus;
	adminUserId: number;
	note: string | null;
}): Promise<{
	applied: number;
	failed: Array<{ id: number; reason: string }>;
}> {
	const ids = options.ids.slice(0, 50);
	const applied: number[] = [];
	const failed: Array<{ id: number; reason: string }> = [];

	for (const id of ids) {
		const result = await updateApplicationStatus({
			id,
			status: options.status,
			adminUserId: options.adminUserId,
			note: options.note,
		});
		if (result.ok) {
			applied.push(id);
		} else {
			failed.push({ id, reason: result.reason });
		}
	}

	return { applied: applied.length, failed };
}

/* ---------------------------- admin: intakes ----------------------------- */

export async function listIntakesAdmin(): Promise<IntakeAdmin[]> {
	const res = await db().query<{
		id: number;
		program_slug: string;
		cohort: string;
		starts_on: Date;
		seats_total: number;
		is_open: boolean;
		applications_count: number;
		seats_occupied: number;
	}>(
		`SELECT i.id, i.program_slug, i.cohort, i.starts_on, i.seats_total, i.is_open,
			(SELECT count(*) FROM enrollment_application a WHERE a.intake_id = i.id)::int AS applications_count,
			(SELECT count(*) FROM enrollment_application a
			 WHERE a.intake_id = i.id
			   AND a.status IN ('pending','reviewing','approved'))::int AS seats_occupied
		 FROM program_intake i
		 ORDER BY i.starts_on DESC, i.program_slug ASC`,
	);
	const out: IntakeAdmin[] = [];
	for (const row of res.rows) {
		const title = programTitle(row.program_slug);
		if (!title) continue;
		out.push({
			id: row.id,
			programSlug: row.program_slug,
			programTitle: title,
			track:
				ALL_PROGRAMS.find((p) => p.slug === row.program_slug)?.track ??
				"barbering",
			cohort: parseCohort(row.cohort) ?? "day",
			startsOn: toDateOnly(row.starts_on),
			seatsTotal: row.seats_total,
			seatsLeft: Math.max(0, row.seats_total - row.seats_occupied),
			isOpen: row.is_open,
			applicationsCount: row.applications_count,
			seatsWarning: row.seats_total - row.seats_occupied < 0,
		});
	}
	return out;
}

/** Occupied-seat count for one intake (used by the intake update guard). */
async function seatsOccupied(
	client: {
		query: (
			t: string,
			p?: unknown[],
		) => Promise<{ rows: Array<Record<string, unknown>> }>;
	},
	intakeId: number,
): Promise<number> {
	const res = await client.query(
		`SELECT count(*)::int AS n FROM enrollment_application
		 WHERE intake_id = $1 AND status IN ('pending','reviewing','approved')`,
		[intakeId],
	);
	return Number(res.rows[0]?.n ?? 0);
}

export type IntakeMutationResult =
	| { ok: true }
	| {
			ok: false;
			reason: "exists" | "not-found" | "has-applications" | "below-occupied";
	  };

export async function createIntake(input: {
	programSlug: string;
	cohort: Cohort;
	startsOn: string;
	seatsTotal: number;
}): Promise<IntakeMutationResult> {
	try {
		await db().query(
			`INSERT INTO program_intake (program_slug, cohort, starts_on, seats_total)
			 VALUES ($1,$2,$3,$4)`,
			[input.programSlug, input.cohort, input.startsOn, input.seatsTotal],
		);
		return { ok: true };
	} catch (error) {
		if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
			return { ok: false, reason: "exists" };
		}
		throw error;
	}
}

export async function updateIntake(
	id: number,
	patch: {
		startsOn?: string;
		seatsTotal?: number;
		isOpen?: boolean;
	},
): Promise<IntakeMutationResult> {
	return withTransaction(async (tx) => {
		const exists = await tx.query<{ id: number }>(
			"SELECT id FROM program_intake WHERE id = $1 FOR UPDATE",
			[id],
		);
		if (exists.rows.length === 0) {
			return { ok: false as const, reason: "not-found" as const };
		}

		if (patch.seatsTotal !== undefined) {
			const occupied = await seatsOccupied(tx, id);
			// Never shrink capacity below seats already spoken for.
			if (patch.seatsTotal < occupied) {
				return { ok: false as const, reason: "below-occupied" as const };
			}
		}

		await tx.query(
			`UPDATE program_intake SET
				starts_on   = COALESCE($2, starts_on),
				seats_total = COALESCE($3, seats_total),
				is_open     = COALESCE($4, is_open)
			 WHERE id = $1`,
			[
				id,
				patch.startsOn ?? null,
				patch.seatsTotal ?? null,
				patch.isOpen ?? null,
			],
		);
		return { ok: true as const };
	});
}

export async function deleteIntake(id: number): Promise<IntakeMutationResult> {
	try {
		const res = await db().query("DELETE FROM program_intake WHERE id = $1", [
			id,
		]);
		return (res.rowCount ?? 0) > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	} catch (error) {
		// FK RESTRICT: applications reference this intake.
		if ((error as { code?: string }).code === PG_FOREIGN_KEY_VIOLATION) {
			return { ok: false, reason: "has-applications" };
		}
		throw error;
	}
}

/* ------------------------------ admin: stats ----------------------------- */

export type AdmissionsStats = {
	byStatus: Record<ApplicationStatus, number>;
	total: number;
	/** Open intakes that have not started yet, soonest first. */
	upcomingOpenIntakes: IntakeAdmin[];
};

export async function getAdmissionsStats(): Promise<AdmissionsStats> {
	const res = await db().query<{ status: string; n: number }>(
		"SELECT status, count(*)::int AS n FROM enrollment_application GROUP BY status",
	);
	const byStatus: Record<ApplicationStatus, number> = {
		pending: 0,
		reviewing: 0,
		approved: 0,
		waitlisted: 0,
		rejected: 0,
		completed: 0,
	};
	let total = 0;
	for (const row of res.rows) {
		const status = parseApplicationStatus(row.status);
		if (!status) continue;
		byStatus[status] = row.n;
		total += row.n;
	}

	const intakes = await listIntakesAdmin();
	const today = startOfToday();
	const upcomingOpenIntakes = intakes
		.filter(
			(intake) =>
				intake.isOpen && new Date(`${intake.startsOn}T00:00:00`) >= today,
		)
		.sort((a, b) => a.startsOn.localeCompare(b.startsOn))
		.slice(0, 6);

	return { byStatus, total, upcomingOpenIntakes };
}
