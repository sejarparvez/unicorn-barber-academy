// routes/dashboard/blog.$id.edit.tsx
// Edit-post editor. Admin-only. Loads the full post (raw markdown included).
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PostEditorPage } from "@/features/blog-admin/post-editor-page";
import { getAdminPostFn, listCategoriesFn } from "@/server/blog-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/$id/edit")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	loader: async ({ params }) => {
		// Garbage ids must 404, not reach the DB with NaN.
		const id = Number.parseInt(params.id, 10);
		if (!Number.isInteger(id) || id < 1) throw notFound();
		const [post, categories] = await Promise.all([
			getAdminPostFn({ data: { id } }),
			listCategoriesFn(),
		]);
		if (!post) throw notFound();
		return { post, categories };
	},
	head: () => ({
		meta: [
			{ title: "Edit post | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: PostEditRoute,
});

function PostEditRoute() {
	const { post, categories } = Route.useLoaderData();
	return <PostEditorPage mode="edit" categories={categories} post={post} />;
}
