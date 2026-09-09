// src/server/users-fns.ts
// Admin-only server functions for user management. Every handler guards
// the session in-handler (server fns are public RPC endpoints).
import { createServerFn } from "@tanstack/react-start";
import type { ListUsersResult } from "@/lib/users";
import { runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import { listUsersAdmin, setUserBan, setUserRole } from "@/server/users-db";
import {
	parseBanChange,
	parseRoleChange,
	parseUserListFilters,
} from "@/server/users-validate";

const ROLE_MESSAGES = {
	"not-found": "User not found",
	self: "You cannot change your own role",
	admin: "Admins cannot be demoted",
} as const;

export const listUsersAdminFn = createServerFn({ method: "GET" })
	.validator((input?: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<ListUsersResult> => {
		await requireAdminSession();
		const parsed = parseUserListFilters(data ?? {});
		if (!parsed.ok) throw new Error(parsed.message);
		return runSafe(() => listUsersAdmin(parsed.value));
	});

export const setUserRoleFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const parsed = parseRoleChange(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const callerId = Number(session.user.id);
		const result = await runSafe(() =>
			setUserRole(parsed.value.targetId, parsed.value.role, callerId),
		);
		if (!result.ok) throw new Error(ROLE_MESSAGES[result.reason]);
		return { ok: true };
	});

export const setUserBanFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const parsed = parseBanChange(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const callerId = Number(session.user.id);
		const result = await runSafe(() =>
			setUserBan(
				parsed.value.targetId,
				parsed.value.banned,
				callerId,
				parsed.value.banReason,
				parsed.value.banExpiresDays,
			),
		);
		if (!result.ok) {
			throw new Error(
				result.reason === "self"
					? "You cannot ban yourself"
					: result.reason === "admin"
						? "Admins cannot be banned — demote the role first"
						: "User not found",
			);
		}
		return { ok: true };
	});
