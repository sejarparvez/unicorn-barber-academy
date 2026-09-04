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
import { generateReference, parseApplicationStatus } from "@/lib/enrollment";
import { db, withTransaction } from "./db";
import { PG_FOREIGN_KEY_VIOLATION, PG_UNIQUE_VIOLATION } from "./pg-codes";
import { programTitle } from "./program-utils";

/** Allowed status transitions. A key maps from the current status to the set of statuses it can move to. */
const VALID_TRANSITIONS: Record<string, readonly string[]> = {
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
	}>(
		`SELECT i.id, i.program_slug, i.cohort, i.starts_on, i.seats_total,
			i.seats_total - (
				SELECT count(*) FROM enrollment_application a
				WHERE a.intake_id = i.id
				  AND a.status IN ('pending', 'reviewing', 'approved')
			)::int AS seats_left
		 FROM program_intake i
		 WHERE i.is_open = TRUE AND i.starts_on >= CURRENT_DATE
		 ORDER BY i.starts_on ASC, i.cohort ASC`,
	);
	const out: IntakePublic[] = [];
	for (const row of res.rows) {
		const title = programTitle(row.program_slug);
		if (!title) continue; // stale slug — never surface it
		const track = ALL_PROGRAMS.find((p) => p.slug === row.program_slug)?.track;
		if (!track) continue;
		out.push({
			id: row.id,
			programSlug: row.program_slug,
			programTitle: title,
			track,
			cohort: row.cohort as Cohort,
			startsOn: toDateOnly(row.starts_on),
			seatsTotal: row.seats_total,
			seatsLeft: Math.max(0, row.seats_left),
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
				status: row.status as ApplicationStatus,
				feeStatus: row.fee_status as FeeStatus,
				programTitle: title,
				programSlug: row.program_slug,
				cohort: row.cohort as Cohort,
				startsOn: toDateOnly(row.starts_on),
				submittedAt: new Date(row.created_at).toISOString(),
			},
		];
	});
}

/* -------------------------------- admin --------------------------------- */

/** Escape LIKE/ILIKE metacharacters so user input can't inject wildcards. */
function escapeLike(term: string): string {
	return term.replace(/[\\%_]/g, "\\$&");
}

export async function listApplicationsAdmin(options: {
	status?: ApplicationStatus;
	search?: string;
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
					status: row.status as ApplicationStatus,
					feeStatus: row.fee_status as FeeStatus,
					fullName: row.full_name,
					email: row.email,
					phone: row.phone,
					programTitle: title,
					programSlug: row.program_slug,
					cohort: row.cohort as Cohort,
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
	}>(
		`SELECT a.id, a.reference, a.status, a.fee_status, a.full_name, a.email,
			a.phone, a.experience_note, a.hear_about, a.decided_at, a.decision_note,
			a.user_id, u.role AS user_role, a.created_at, a.updated_at,
			i.id AS intake_id, i.program_slug, i.cohort, i.starts_on,
			i.is_open AS intake_open, i.seats_total,
			(SELECT count(*) FROM enrollment_application x
			 WHERE x.intake_id = i.id
			   AND x.status IN ('pending','reviewing','approved'))::int AS seats_occupied
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

	return {
		application: {
			id: row.id,
			reference: row.reference,
			status: row.status as ApplicationStatus,
			feeStatus: row.fee_status as FeeStatus,
			fullName: row.full_name,
			email: row.email,
			phone: row.phone,
			programTitle: title,
			programSlug: row.program_slug,
			cohort: row.cohort as Cohort,
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
	const TERMINAL: readonly string[] = [
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
		const allowed = VALID_TRANSITIONS[current.status];
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

/** Offline fee bookkeeping (bKash/cash/bank recorded at the academy). */
export async function setApplicationFee(
	id: number,
	paid: boolean,
): Promise<boolean> {
	const res = await db().query(
		`UPDATE enrollment_application SET
			fee_status = $2::varchar,
			fee_paid_at = CASE WHEN $2::text = 'paid' THEN now() ELSE NULL END,
			updated_at = now()
		 WHERE id = $1`,
		[id, (paid ? "paid" : "unpaid") satisfies FeeStatus],
	);
	return (res.rowCount ?? 0) > 0;
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
			cohort: row.cohort as Cohort,
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
