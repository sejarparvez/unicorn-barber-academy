// routes/dashboard/blog.categories.tsx
// Category manager. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { CategoriesPage } from "@/features/blog-admin/categories-page";
import { listCategoriesFn } from "@/server/blog-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/categories")({
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
			{ title: "Blog categories | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: CategoriesRoute,
});

function CategoriesRoute() {
	const categories = Route.useLoaderData();
	return <CategoriesPage categories={categories} />;
}
