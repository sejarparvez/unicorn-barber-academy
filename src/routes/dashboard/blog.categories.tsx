// routes/dashboard/blog.categories.tsx
// Category manager. Admin-only. Reads via useBlogCategories (service layer).
import { createFileRoute } from "@tanstack/react-router";
import { CategoriesPage } from "@/features/blog-admin/categories-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/blog/categories")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
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
