// routes/api/admin/blog/$id.tsx
// PATCH /api/admin/blog/:id — update any post field (partial patch).
// DELETE /api/admin/blog/:id — remove a post permanently.
// Admin-session guarded; slug changes re-check uniqueness excluding self.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import {
	deletePost,
	getPostById,
	uniqueSlug,
	updatePost,
} from "@/server/blog-db";
import { parsePostPayload } from "@/server/blog-validate";
import { deleteImage, keyFromUrl } from "@/server/storage";

type Params = { id: string };

function parseId(params: Params): number | null {
	const id = Number.parseInt(params.id, 10);
	return Number.isInteger(id) && id > 0 ? id : null;
}

export const Route = createFileRoute("/api/admin/blog/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = parseId(params as Params);
				if (!id) return json({ message: "Invalid post id" }, { status: 400 });

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				// Status-only quick action from the list page ({ action }) —
				// deliberately does NOT touch any other column, unlike a full
				// editor save.
				const action = typeof body.action === "string" ? body.action : null;
				if (action) {
					const statusByAction = {
						publish: "published",
						unpublish: "draft",
						archive: "archived",
					} as const;
					const nextStatus =
						statusByAction[action as keyof typeof statusByAction];
					if (!nextStatus) {
						return json({ message: "Unknown action" }, { status: 400 });
					}
					try {
						// Same thin-content guard as the editor save path: a quick
						// publish must never ship an empty article.
						const current = await getPostById(id);
						if (!current) {
							return json({ message: "Post not found" }, { status: 404 });
						}
						if (nextStatus === "published" && !current.contentMd.trim()) {
							return json(
								{ message: "Cannot publish an empty post" },
								{ status: 400 },
							);
						}
						const post = await updatePost(id, { status: nextStatus });
						if (!post) {
							return json({ message: "Post not found" }, { status: 404 });
						}
						return json({ post });
					} catch (error) {
						console.error("[blog] action failed:", error);
						return json({ message: "Request failed" }, { status: 500 });
					}
				}

				const parsed = parsePostPayload(body);
				if (!parsed.ok) {
					return json({ message: parsed.message }, { status: 400 });
				}
				const input = parsed.value;

				if (input.status === "published" && !input.contentMd.trim()) {
					return json(
						{ message: "Cannot publish an empty post" },
						{ status: 400 },
					);
				}

				// Slug edits are explicit: the editor sends slug only when the
				// admin changed it; otherwise keep the stored one.
				const { slug: parsedSlug, ...rest } = input;
				let slug: string | undefined;
				try {
					if (typeof (body as Record<string, unknown>).slug === "string") {
						slug = await uniqueSlug(parsedSlug ?? "post", id);
					}

					const post = await updatePost(id, {
						...rest,
						...(slug ? { slug } : {}),
					});
					if (!post) {
						return json({ message: "Post not found" }, { status: 404 });
					}
					return json({ post });
				} catch (error) {
					console.error("[blog] update failed:", error);
					return json({ message: "Could not save post" }, { status: 500 });
				}
			},
			DELETE: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = parseId(params as Params);
				if (!id) return json({ message: "Invalid post id" }, { status: 400 });

				try {
					const post = await getPostById(id);
					const deleted = await deletePost(id);
					if (!deleted) {
						return json({ message: "Post not found" }, { status: 404 });
					}
					// Best-effort cleanup of Cloudinary assets so deleted posts
					// don't leave orphan images. Must not fail the deletion.
					if (post) {
						const urls = [post.coverImageUrl, post.ogImageUrl];
						for (const url of urls) {
							if (!url) continue;
							const publicId = keyFromUrl(url);
							if (publicId) {
								await deleteImage(publicId).catch((error) => {
									console.error("[blog] image cleanup failed:", error);
								});
							}
						}
					}
					return json({ ok: true });
				} catch (error) {
					console.error("[blog] delete failed:", error);
					return json({ message: "Could not delete post" }, { status: 500 });
				}
			},
		},
	},
});
