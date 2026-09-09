// src/server/users-db.ts
// Server-only data access for admin user management. better-auth owns the
// user table via its own pool; this module performs the same privileged
// writes the better-auth admin plugin would (role, banned, banReason,
// banExpires) through the app pool so the dashboard can manage accounts.
// Reads are safe to serve from any pool — single row shape, no relations.
import type { Role } from "@/lib/roles";
import { parseRole, ROLES } from "@/lib/roles";
import type { AdminUserRow, ListUsersResult } from "@/lib/users";
import { db } from "../db";

const PAGE_SIZE = 20;

function toRow(row: {
	id: number;
	name: string | null;
	email: string;
	emailVerified: boolean;
	role: string | null;
	banned: boolean;
	banReason: string | null;
	banExpires: Date | null;
	createdAt: Date;
}): AdminUserRow {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		emailVerified: row.emailVerified,
		role: parseRole(row.role) ?? "user",
		banned: row.banned,
		banReason: row.banReason,
		banExpires: row.banExpires ? new Date(row.banExpires).toISOString() : null,
		createdAt: new Date(row.createdAt).toISOString(),
	};
}

export async function listUsersAdmin(options: {
	search?: string;
	role?: Role;
	banned?: boolean;
	page?: number;
}): Promise<ListUsersResult> {
	const page = Math.max(1, options.page ?? 1);
	const conditions: string[] = [];
	const params: unknown[] = [];
	if (options.search) {
		params.push(`%${options.search}%`);
		conditions.push(
			`(u.email ILIKE $${params.length} OR u.name ILIKE $${params.length})`,
		);
	}
	if (options.role) {
		params.push(options.role);
		conditions.push(`u.role = $${params.length}`);
	}
	if (options.banned !== undefined) {
		params.push(options.banned);
		conditions.push(`u.banned = $${params.length}`);
	}
	const where =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const totalRes = await db().query<{ count: string }>(
		`SELECT count(*) AS count FROM "user" u ${where}`,
		params,
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const res = await db().query<{
		id: number;
		name: string | null;
		email: string;
		emailVerified: boolean;
		role: string | null;
		banned: boolean;
		banReason: string | null;
		banExpires: Date | null;
		createdAt: Date;
	}>(
		`SELECT u.id, u.name, u.email, u."emailVerified" AS "emailVerified",
			u.role, u.banned, u."banReason" AS "banReason",
			u."banExpires" AS "banExpires", u."createdAt" AS "createdAt"
		 FROM "user" u ${where}
		 ORDER BY u."createdAt" DESC LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
		params,
	);
	return {
		items: res.rows.map(toRow),
		total,
		page,
		totalPages,
	};
}

export type RoleChangeResult =
	| { ok: true; email: string; oldRole: Role }
	| { ok: false; reason: "not-found" | "self" | "admin" };

/**
 * Change a user's academy role. Safety rails (also mirrored in the UI,
 * which disables unreachable actions):
 * - nobody changes their own role (would lock the operator out on misclick),
 * - NOBODY demotes an admin — admin roles are permanent once granted
 *   (promotions TO admin are still allowed, with UI confirmation).
 */
export async function setUserRole(
	targetId: number,
	role: Role,
	callerId: number,
): Promise<RoleChangeResult> {
	if (targetId === callerId) return { ok: false, reason: "self" };
	if (!ROLES.includes(role)) return { ok: false, reason: "not-found" };

	const current = await db().query<{ email: string; role: string | null }>(
		'SELECT email, role FROM "user" WHERE id = $1',
		[targetId],
	);
	if (current.rows.length === 0) return { ok: false, reason: "not-found" };
	if (current.rows[0]?.role === role) {
		return {
			ok: true,
			email: current.rows[0]?.email ?? "",
			oldRole: parseRole(current.rows[0]?.role) ?? "user",
		};
	}

	if (current.rows[0]?.role === "admin") {
		return { ok: false, reason: "admin" };
	}

	await db().query(
		'UPDATE "user" SET role = $1, "updatedAt" = now() WHERE id = $2',
		[role, targetId],
	);
	return {
		ok: true,
		email: current.rows[0]?.email ?? "",
		oldRole: parseRole(current.rows[0]?.role) ?? "user",
	};
}

export type BanResult =
	| { ok: true; email: string }
	| { ok: false; reason: "not-found" | "self" | "admin" };

/**
 * Ban or unban an account. better-auth refuses sessions for banned users
 * automatically; banExpires null means indefinite. Reason is required when
 * banning so the audit trail (banReason column) always explains itself.
 *
 * Protected targets (also enforced in the fn layer):
 * - nobody bans themselves,
 * - NOBODY bans an admin — admins can only be demoted to a lesser role
 *   first (by another admin), which keeps a compromised session from
 *   locking the whole console out in one click.
 */
export async function setUserBan(
	targetId: number,
	banned: boolean,
	callerId: number,
	banReason: string | null,
	banExpiresDays: number | null,
): Promise<BanResult> {
	if (targetId === callerId) return { ok: false, reason: "self" };
	const target = await db().query<{ email: string; role: string | null }>(
		'SELECT email, role FROM "user" WHERE id = $1',
		[targetId],
	);
	if (target.rows.length === 0) return { ok: false, reason: "not-found" };
	if (banned && target.rows[0]?.role === "admin") {
		return { ok: false, reason: "admin" };
	}

	const expires =
		banned && banExpiresDays !== null
			? new Date(Date.now() + banExpiresDays * 86_400_000)
			: null;
	await db().query(
		'UPDATE "user" SET banned = $1, "banReason" = $2, "banExpires" = $3, "updatedAt" = now() WHERE id = $4',
		[banned, banned ? banReason : null, expires, targetId],
	);
	return { ok: true, email: target.rows[0]?.email ?? "" };
}
