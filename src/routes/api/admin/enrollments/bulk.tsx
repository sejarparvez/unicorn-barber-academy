// routes/api/admin/enrollments/bulk.tsx
// POST /api/admin/enrollments/bulk — batch status update for multiple applications.
// Body: { ids: number[], status: ApplicationStatus, note?: string }
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseApplicationStatus } from "@/lib/enrollment";
import { requireAdminApi } from "@/server/admin-api";
import { logAdminAction } from "@/server/audit/audit-log";
import { bulkUpdateApplicationStatus } from "@/server/enrollment/enrollment-db";

export const Route = createFileRoute("/api/admin/enrollments/bulk")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				const ids = Array.isArray(body.ids)
					? body.ids.filter((v): v is number => typeof v === "number" && v > 0)
					: [];
				if (ids.length === 0 || ids.length > 50) {
					return json(
						{ message: "Provide 1–50 application IDs" },
						{ status: 400 },
					);
				}

				const status = parseApplicationStatus(body.status);
				if (!status) {
					return json({ message: "Unknown status" }, { status: 400 });
				}

				const note =
					typeof body.note === "string" && body.note.trim()
						? body.note.trim().slice(0, 2000)
						: null;

				const result = await bulkUpdateApplicationStatus({
					ids,
					status,
					adminUserId: guard.userId,
					note,
				});

				await logAdminAction({
					actorId: guard.userId,
					action: "application.bulk-status",
					targetType: "application",
					targetId: `${ids.length} items`,
					summary: `Bulk set ${result.applied} application(s) to ${status} (${result.failed.length} failed)`,
					metadata: {
						status,
						applied: result.applied,
						failed: result.failed.length,
					},
				});
				return json(result);
			},
		},
	},
});
