// routes/api/admin/blog/bulk.tsx
// POST /api/admin/blog/bulk — batch status update or delete for multiple posts.
// Body: { ids: number[], action: "status" | "delete", status?: BlogStatus }
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseBlogStatus } from "@/lib/blog";
import { requireAdminApi } from "@/server/admin-api";
import { bulkDeletePosts, bulkUpdatePostStatus } from "@/server/blog/blog-db";

export const Route = createFileRoute("/api/admin/blog/bulk")({
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
					return json({ message: "Provide 1–50 post IDs" }, { status: 400 });
				}

				const action = body.action;
				if (action === "delete") {
					const result = await bulkDeletePosts(ids);
					return json(result);
				}

				if (action === "status") {
					const status = parseBlogStatus(body.status);
					if (!status) {
						return json({ message: "Unknown status" }, { status: 400 });
					}
					const result = await bulkUpdatePostStatus(ids, status);
					return json(result);
				}

				return json(
					{ message: "Action must be 'status' or 'delete'" },
					{ status: 400 },
				);
			},
		},
	},
});
