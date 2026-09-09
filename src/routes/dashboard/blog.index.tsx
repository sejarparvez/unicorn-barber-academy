// routes/dashboard/blog.index.tsx
// Admin post listing. Admin-only: the dashboard layout already requires a
// session; this tightens it to the admin role.
import { createFileRoute } from "@tanstack/react-router";
import { PostListPage } from "@/features/blog-admin/post-list-page";
import { parseBlogStatus } from "@/lib/blog";
import { requireRoles } from "@/server/guards";

type BlogSearch = {
	status?: ReturnType<typeof parseBlogStatus>;
	search?: string;
	category?: number;
	page?: number;
	sort?: "views";
};

export const Route = createFileRoute("/dashboard/blog/")({
	validateSearch: (search: Record<string, unknown>): BlogSearch => {
		const status = parseBlogStatus(search.status);
		const page = Number.parseInt(String(search.page ?? ""), 10);
		const searchStr =
			typeof search.search === "string"
				? search.search.trim() || undefined
				: undefined;
		const category = Number.parseInt(String(search.category ?? ""), 10);
		return {
			...(status ? { status } : {}),
			...(searchStr ? { search: searchStr } : {}),
			...(Number.isInteger(category) && category > 0 ? { category } : {}),
			...(Number.isInteger(page) && page > 1 ? { page } : {}),
			...(search.sort === "views" ? { sort: "views" as const } : {}),
		};
	},
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	// Reads flow through useAdminPosts (src/service/blog.ts) so post
	// mutations invalidate precisely — no loader to double-fetch.
	head: () => ({
		meta: [
			{ title: "Blog posts | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: PostListRoute,
});

function PostListRoute() {
	const { status, search, category, page, sort } = Route.useSearch();
	return (
		<PostListPage
			statusFilter={status}
			search={search}
			categoryFilter={category}
			page={page ?? 1}
			sortByViews={sort === "views"}
		/>
	);
}
