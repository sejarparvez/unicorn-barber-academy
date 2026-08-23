// routes/api/admin/blog/categories/$id.tsx
// PATCH — rename a category. DELETE — remove it (posts keep existing via
// ON DELETE SET NULL). Admin-session guarded.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { deleteCategory, renameCategory } from "@/server/blog-db";
import { parseCategoryPayload } from "@/server/blog-validate";

type Params = { id: string };

export const Route = createFileRoute("/api/admin/blog/categories/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid category id" }, { status: 400 });
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				const parsed = parseCategoryPayload(body);
				if (!parsed.ok) {
					return json({ message: parsed.message }, { status: 400 });
				}

				const updated = await renameCategory(id, parsed.value);
				if (!updated) {
					return json({ message: "Category not found" }, { status: 404 });
				}
				return json({ ok: true });
			},
			DELETE: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid category id" }, { status: 400 });
				}

				const deleted = await deleteCategory(id);
				if (!deleted) {
					return json({ message: "Category not found" }, { status: 404 });
				}
				return json({ ok: true });
			},
		},
	},
});
