// routes/dashboard/blog.new.tsx
// Create-post editor. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { FormSkeleton } from "@/components/route-skeletons";
import { PostEditorPage } from "@/features/blog-admin/post-editor-page";
import { listCategoriesFn } from "@/server/blog/blog-fns";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/new")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	loader: () => listCategoriesFn(),
	pendingComponent: FormSkeleton,
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
