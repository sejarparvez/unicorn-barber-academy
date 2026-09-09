// src/server/audit-log.ts
// Append-only admin audit trail. Call logAdminAction() AFTER a privileged
// mutation succeeds — it catches internally so logging can never break the
// mutation it records (same philosophy as fire-and-forget mails).
import type { AuditAction, AuditEntry, AuditListResult } from "@/lib/audit";
import { db } from "./db";

export async function logAdminAction(input: {
	actorId: number;
	action: AuditAction;
	targetType: string;
	targetId: string | number;
	summary: string;
	metadata?: Record<string, unknown>;
}): Promise<void> {
	try {
		await db().query(
			`INSERT INTO admin_audit_log
				(actor_id, action, target_type, target_id, summary, metadata)
			 VALUES ($1,$2,$3,$4,$5,$6)`,
			[
				input.actorId,
				input.action,
				input.targetType,
				String(input.targetId),
				input.summary,
				JSON.stringify(input.metadata ?? {}),
			],
		);
	} catch (error) {
		console.error("[audit] failed to record admin action:", error);
	}
}

export async function listAuditLog(options: {
	actorId?: number;
	action?: string;
	page?: number;
}): Promise<AuditListResult> {
	const page = Math.max(1, options.page ?? 1);
	const perPage = 20;
	const conditions: string[] = [];
	const params: unknown[] = [];
	if (options.actorId !== undefined) {
		params.push(options.actorId);
		conditions.push(`l.actor_id = $${params.length}`);
	}
	if (options.action) {
		params.push(options.action);
		conditions.push(`l.action = $${params.length}`);
	}
	const where =
		conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

	const totalRes = await db().query<{ count: string }>(
		`SELECT count(*) AS count FROM admin_audit_log l ${where}`,
		params,
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);

	const res = await db().query<{
		id: number;
		actor_id: number;
		actor_email: string | null;
		actor_name: string | null;
		action: string;
		target_type: string;
		target_id: string;
		summary: string;
		metadata: unknown;
		created_at: Date;
	}>(
		`SELECT l.id, l.actor_id, u.email AS actor_email, u.name AS actor_name,
			l.action, l.target_type, l.target_id, l.summary, l.metadata, l.created_at
		 FROM admin_audit_log l
		 LEFT JOIN "user" u ON u.id = l.actor_id
		 ${where}
		 ORDER BY l.created_at DESC, l.id DESC
		 LIMIT ${perPage} OFFSET ${(page - 1) * perPage}`,
		params,
	);
	return {
		items: res.rows.map(
			(row): AuditEntry => ({
				id: row.id,
				actorId: row.actor_id,
				actorEmail: row.actor_email,
				actorName: row.actor_name,
				action: row.action,
				targetType: row.target_type,
				targetId: row.target_id,
				summary: row.summary,
				metadata:
					typeof row.metadata === "string"
						? row.metadata
						: JSON.stringify(row.metadata ?? {}),
				createdAt: new Date(row.created_at).toISOString(),
			}),
		),
		total,
		page,
		totalPages: Math.max(1, Math.ceil(total / perPage)),
	};
}
