// src/server/audit-fns.ts
// Admin-only read access to the audit trail (writes happen fire-and-forget
// inside the mutation handlers themselves — never through a public fn).
import { createServerFn } from "@tanstack/react-start";
import type { AuditListResult } from "@/lib/audit";
import { listAuditLog } from "@/server/audit/audit-log";
import { clampId, clampPage, runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";

export const listAuditLogFn = createServerFn({ method: "GET" })
	.validator(
		(input?: { actorId?: number; action?: string; page?: number }) => input,
	)
	.handler(async ({ data }): Promise<AuditListResult> => {
		await requireAdminSession();
		const actorId =
			data?.actorId !== undefined ? clampId(data.actorId) : undefined;
		return runSafe(() =>
			listAuditLog({
				...(actorId ? { actorId } : {}),
				...(typeof data?.action === "string" && data.action
					? { action: data.action.slice(0, 48) }
					: {}),
				page: clampPage(data?.page),
			}),
		);
	});
