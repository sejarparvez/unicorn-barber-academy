// src/server/program-db.ts
// Server-only data access for the program catalog table. Marketing copy
// stays in src/data/programs.ts; this table owns what admin controls:
// which programs are live (isPublished), the fee (feePoisha), and the
// default seat count. Intake creation validates slugs against this table.
import type { ProgramAdmin, ProgramOption } from "@/lib/enrollment";
import { db } from "./db";

export type ProgramMutationResult =
	| { ok: true }
	| { ok: false; reason: "not-found" };

/** Dropdown options: published programs only. */
export async function listProgramOptions(): Promise<ProgramOption[]> {
	const res = await db().query<{
		slug: string;
		title: string;
		track: string;
		fee_poisha: number;
		default_seats: number;
	}>(
		`SELECT slug, title, track, fee_poisha, default_seats
		 FROM program WHERE is_published = TRUE ORDER BY title ASC`,
	);
	return res.rows.map((row) => ({
		slug: row.slug,
		title: row.title,
		track:
			row.track === "beauty" ? ("beauty" as const) : ("barbering" as const),
		feePoisha: row.fee_poisha,
		defaultSeats: row.default_seats,
	}));
}

/** True when the slug exists and is published. */
export async function isProgramLive(slug: string): Promise<boolean> {
	const res = await db().query<{ one: number }>(
		`SELECT 1 AS one FROM program WHERE slug = $1 AND is_published = TRUE`,
		[slug],
	);
	return res.rows.length > 0;
}

/** Admin overview: every program with live intake stats and fee collection. */
export async function listProgramsAdmin(): Promise<ProgramAdmin[]> {
	const res = await db().query<{
		slug: string;
		title: string;
		track: string;
		duration: string;
		fee_poisha: number;
		default_seats: number;
		is_published: boolean;
		open_intakes: number;
		seats_total: number;
		seats_filled: number;
		pending_count: number;
		collected_poisha: number;
	}>(
		`SELECT p.slug, p.title, p.track, p.duration, p.fee_poisha,
			p.default_seats, p.is_published,
			count(DISTINCT CASE WHEN i.is_open = TRUE AND i.starts_on >= CURRENT_DATE THEN i.id END)::int AS open_intakes,
			coalesce(sum(CASE WHEN i.is_open = TRUE AND i.starts_on >= CURRENT_DATE THEN i.seats_total END), 0)::int AS seats_total,
			coalesce(sum(CASE WHEN i.is_open = TRUE AND i.starts_on >= CURRENT_DATE THEN (
				SELECT count(*) FROM enrollment_application a
				WHERE a.intake_id = i.id AND a.status IN ('pending', 'reviewing', 'approved')
			) END), 0)::int AS seats_filled,
			coalesce(sum(CASE WHEN i.is_open = TRUE AND i.starts_on >= CURRENT_DATE THEN (
				SELECT count(*) FROM enrollment_application a
				WHERE a.intake_id = i.id AND a.status = 'pending'
			) END), 0)::int AS pending_count,
			coalesce(sum(CASE WHEN i.is_open = TRUE AND i.starts_on >= CURRENT_DATE THEN (
				SELECT coalesce(sum(f.amount_poisha), 0) FROM fee_payment f
				JOIN enrollment_application a ON a.id = f.application_id
				WHERE a.intake_id = i.id
			) END), 0)::int AS collected_poisha
		 FROM program p
		 LEFT JOIN program_intake i ON i.program_slug = p.slug
		 GROUP BY p.slug, p.title, p.track, p.duration, p.fee_poisha,
			p.default_seats, p.is_published
		 ORDER BY p.title ASC`,
	);
	return res.rows.map((row) => ({
		slug: row.slug,
		title: row.title,
		track:
			row.track === "beauty" ? ("beauty" as const) : ("barbering" as const),
		duration: row.duration,
		feePoisha: row.fee_poisha,
		defaultSeats: row.default_seats,
		isPublished: row.is_published,
		openIntakes: row.open_intakes,
		seatsTotal: row.seats_total,
		seatsFilled: row.seats_filled,
		pendingCount: row.pending_count,
		collectedPoisha: row.collected_poisha,
	}));
}

export async function updateProgram(
	slug: string,
	patch: {
		title?: string;
		duration?: string;
		feePoisha?: number;
		defaultSeats?: number;
		isPublished?: boolean;
	},
): Promise<ProgramMutationResult> {
	const sets: string[] = [];
	const params: unknown[] = [];
	const push = (sql: string, value: unknown) => {
		params.push(value);
		sets.push(`${sql} $${params.length}`);
	};
	if (patch.title !== undefined) push("title =", patch.title);
	if (patch.duration !== undefined) push("duration =", patch.duration);
	if (patch.feePoisha !== undefined) push("fee_poisha =", patch.feePoisha);
	if (patch.defaultSeats !== undefined)
		push("default_seats =", patch.defaultSeats);
	if (patch.isPublished !== undefined)
		push("is_published =", patch.isPublished);
	if (sets.length === 0) {
		const exists = await db().query<{ one: number }>(
			`SELECT 1 AS one FROM program WHERE slug = $1`,
			[slug],
		);
		return exists.rows.length > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	}
	params.push(slug);
	const res = await db().query(
		`UPDATE program SET ${sets.join(", ")}, updated_at = now() WHERE slug = $${params.length}`,
		params,
	);
	return (res.rowCount ?? 0) > 0
		? { ok: true }
		: { ok: false, reason: "not-found" };
}
