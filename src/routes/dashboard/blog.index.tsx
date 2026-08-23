// routes/dashboard/blog.index.tsx
// Admin post listing. Admin-only: the dashboard layout already requires a
// session; this tightens it to the admin role.
import { createFileRoute } from "@tanstack/react-router";
import { PostListPage } from "@/features/blog-admin/post-list-page";
import { parseBlogStatus } from "@/lib/blog";
import { listAdminPostsFn } from "@/server/blog-fns";
import { requireRoles } from "@/server/guards";

type BlogSearch = {
	status?: ReturnType<typeof parseBlogStatus>;
	page?: number;
};

export const Route = createFileRoute("/dashboard/blog/")({
	validateSearch: (search: Record<string, unknown>): BlogSearch => {
		const status = parseBlogStatus(search.status);
		const page = Number.parseInt(String(search.page ?? ""), 10);
		return {
			...(status ? { status } : {}),
			...(Number.isInteger(page) && page > 1 ? { page } : {}),
		};
	},
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	loader: ({ location }) =>
		listAdminPostsFn({
			data: {
				status: (location.search as BlogSearch).status,
				page: (location.search as BlogSearch).page,
			},
		}),
	head: () => ({
		meta: [
			{ title: "Blog posts | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: PostListRoute,
});

function PostListRoute() {
	const data = Route.useLoaderData();
	const { status } = Route.useSearch();
	return <PostListPage data={data} statusFilter={status} />;
}
