// routes/blog.index.tsx
// Public journal index. Loader pulls published posts from the DB; search
// param ?page=N drives crawlable pagination.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { BlogPage } from "@/features/blog/blog-page";
import { listCategoriesFn, listPublishedPostsFn } from "@/server/blog-fns";

type BlogIndexSearch = { page?: number };

export const Route = createFileRoute("/blog/")({
	validateSearch: (search: Record<string, unknown>): BlogIndexSearch => {
		const page = Number.parseInt(String(search.page ?? ""), 10);
		return Number.isInteger(page) && page > 1 ? { page } : {};
	},
	// Server functions so client-side pagination refetches on the server.
	loader: async ({ location }) => {
		const search = location.search as BlogIndexSearch;
		const [posts, categories] = await Promise.all([
			listPublishedPostsFn({ data: { page: search.page ?? 1 } }),
			listCategoriesFn(),
		]);
		// Out-of-range ?page= is a bad URL, not an empty journal — 404 it
		// instead of rendering "coming soon" copy under a canonical /blog.
		if (search.page && posts.page !== search.page) {
			throw notFound();
		}
		return { posts, categories };
	},
	head: ({ loaderData }) => {
		const page = loaderData?.posts.page ?? 1;
		const totalPages = loaderData?.posts.totalPages ?? 1;
		// Canonicalize junk/out-of-range ?page= values back to the index.
		const validPage = page > 1 && page <= totalPages;
		const url = validPage
			? `${SITE_URL}/blog?page=${page}`
			: `${SITE_URL}/blog`;
		return {
			meta: [
				{
					title: validPage
						? `Blog (page ${page}) | Unicorn Barber Training Academy`
						: "Blog | Unicorn Barber Training Academy",
					description:
						"Articles on barbering technique, beauty careers, and professional training in Dhaka from Unicorn Barber Training Academy.",
				},
				{
					property: "og:title",
					content: "Blog | Unicorn Barber Training Academy",
				},
				{
					property: "og:description",
					content:
						"Articles on barbering technique, beauty careers, and professional training in Dhaka.",
				},
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	component: BlogRoute,
});

function BlogRoute() {
	const { posts, categories } = Route.useLoaderData();
	const { page = 1 } = Route.useSearch();
	return <BlogPage posts={posts} categories={categories} page={page} />;
}
