// routes/dashboard/blog.new.tsx
// Create-post editor. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { PostEditorPage } from "@/features/blog-admin/post-editor-page";
import { listCategoriesFn } from "@/server/blog-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/new")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	loader: () => listCategoriesFn(),
	head: () => ({
		meta: [
			{ title: "New post | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: PostEditorRoute,
});

function PostEditorRoute() {
	const categories = Route.useLoaderData();
	return <PostEditorPage mode="new" categories={categories} />;
}
