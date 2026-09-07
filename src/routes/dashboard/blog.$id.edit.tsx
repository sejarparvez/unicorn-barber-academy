// routes/dashboard/blog.$id.edit.tsx
// Edit-post editor. Admin-only. Loads the full post (raw markdown included).
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
	errorComponent: PostEditError,
	component: PostEditRoute,
});

function PostEditError() {
	return (
		<div className="space-y-4 p-6">
			<h1 className="font-heading text-xl font-semibold">Post unavailable</h1>
			<p className="text-sm text-muted-foreground">
				This post could not be loaded. It may have been deleted or there was a
				temporary server error.
			</p>
			<Link
				to="/dashboard/blog"
				className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
			>
				Back to blog posts
			</Link>
		</div>
	);
}

function PostEditRoute() {
	const { post, categories } = Route.useLoaderData();
	return <PostEditorPage mode="edit" categories={categories} post={post} />;
}
