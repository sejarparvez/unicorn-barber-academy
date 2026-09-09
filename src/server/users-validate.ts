// src/server/users-validate.ts
// Manual payload validation for admin user-management endpoints (house
// style — no schema library), mirrors enrollment-validate.ts.
import { parseRole, type Role } from "@/lib/roles";
import { clampId, clampPage, clampSearchTerm } from "./fn-utils";
import type { ValidationResult } from "./validate-utils";
import { str } from "./validate-utils";

export type { ValidationResult } from "./validate-utils";

export function parseUserListFilters(body: unknown): ValidationResult<{
	search?: string;
	role?: Role;
	banned?: boolean;
	page: number;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const roleRaw = str(b.role);
	const role = roleRaw ? parseRole(roleRaw) : undefined;
	if (roleRaw && !role) return { ok: false, message: "Unknown role" };
	const bannedRaw = b.banned;
	const banned =
		bannedRaw === undefined || bannedRaw === null || bannedRaw === ""
			? undefined
			: bannedRaw === true || bannedRaw === "true";
	return {
		ok: true,
		value: {
			search: clampSearchTerm(b.search, 100) || undefined,
			role,
			banned,
			page: clampPage(typeof b.page === "number" ? b.page : undefined),
		},
	};
}

export function parseRoleChange(body: unknown): ValidationResult<{
	targetId: number;
	role: Role;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const targetId = clampId(b.targetId);
	if (!targetId) return { ok: false, message: "Invalid user id" };
	const role = parseRole(str(b.role));
	if (!role) return { ok: false, message: "Unknown role" };
	return { ok: true, value: { targetId, role } };
}

export function parseBanChange(body: unknown): ValidationResult<{
	targetId: number;
	banned: boolean;
	banReason: string | null;
	banExpiresDays: number | null;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const targetId = clampId(b.targetId);
	if (!targetId) return { ok: false, message: "Invalid user id" };
	const banned = b.banned === true || b.banned === "true";
	if (
		b.banned !== true &&
		b.banned !== "true" &&
		b.banned !== false &&
		b.banned !== "false"
	) {
		return { ok: false, message: "banned must be a boolean" };
	}
	let banReason: string | null = null;
	let banExpiresDays: number | null = null;
	if (banned) {
		banReason = str(b.banReason).slice(0, 500);
		if (!banReason) return { ok: false, message: "A ban reason is required" };
		if (
			b.banExpiresDays !== undefined &&
			b.banExpiresDays !== null &&
			b.banExpiresDays !== ""
		) {
			const days = Number.parseInt(String(b.banExpiresDays), 10);
			if (!Number.isInteger(days) || days < 1 || days > 3650) {
				return { ok: false, message: "Ban length must be 1–3650 days" };
			}
			banExpiresDays = days;
		}
	}
	return { ok: true, value: { targetId, banned, banReason, banExpiresDays } };
}
