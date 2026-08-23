// routes/dashboard/blog.categories.tsx
// Category manager. Admin-only. Reads via useBlogCategories (service layer).
import { createFileRoute } from "@tanstack/react-router";
import { CategoriesPage } from "@/features/blog-admin/categories-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/categories")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	head: () => ({
		meta: [
			{ title: "Blog categories | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: CategoriesRoute,
});

function CategoriesRoute() {
	return <CategoriesPage />;
}
