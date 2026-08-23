// routes/api/admin/blog/categories.tsx
// POST — create a category. Admin-session guarded.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { createCategory, uniqueCategorySlug } from "@/server/blog-db";
import { parseCategoryPayload } from "@/server/blog-validate";

export const Route = createFileRoute("/api/admin/blog/categories")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
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

				try {
					const slug = await uniqueCategorySlug(parsed.value.slug);
					const category = await createCategory({ ...parsed.value, slug });
					return json({ category }, { status: 201 });
				} catch (error) {
					console.error("[categories] create failed:", error);
					return json(
						{ message: "Could not create category" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
