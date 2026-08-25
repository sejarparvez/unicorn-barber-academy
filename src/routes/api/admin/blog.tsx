// routes/api/admin/blog.tsx
// POST /api/admin/blog — create a post. Admin-session guarded; slug
// uniqueness is resolved server-side so two editors can't collide.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { createPost, getPostById, uniqueSlug } from "@/server/blog-db";
import { parsePostPayload } from "@/server/blog-validate";

export const Route = createFileRoute("/api/admin/blog")({
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

				const parsed = parsePostPayload(body);
				if (!parsed.ok) {
					return json({ message: parsed.message }, { status: 400 });
				}
				const input = parsed.value;

				// Publishing requires something to publish.
				if (input.status === "published" && !input.contentMd.trim()) {
					return json(
						{ message: "Cannot publish an empty post" },
						{ status: 400 },
					);
				}

				try {
					const slug = await uniqueSlug(input.slug ?? "post");
					const post = await createPost({
						...input,
						slug,
						authorId: guard.userId,
					});
					if (!post) {
						return json({ message: "Could not create post" }, { status: 500 });
					}
					return json({ post }, { status: 201 });
				} catch (error) {
					console.error("[blog] create failed:", error);
					return json({ message: "Could not create post" }, { status: 500 });
				}
			},
			// Convenience for the editor's slug field: ?slug-check=<value>
			GET: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const url = new URL(request.url);
				const idRaw = url.searchParams.get("id");
				const id = Number.parseInt(idRaw ?? "", 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Nothing to fetch" }, { status: 400 });
				}
				try {
					const post = await getPostById(id);
					return json({ post });
				} catch (error) {
					console.error("[blog] fetch failed:", error);
					return json({ message: "Request failed" }, { status: 500 });
				}
			},
		},
	},
});
