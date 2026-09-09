// routes/blog.index.tsx
// Public journal index. Loader pulls published posts from the DB; search
// param ?page=N drives crawlable pagination.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/route-skeletons";
import { SITE_URL } from "@/data/site";
import { BlogPage } from "@/features/blog/blog-page";
import { listCategoriesFn, listPublishedPostsFn } from "@/server/blog/blog-fns";

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
	pendingComponent: () => <CardGridSkeleton count={6} />,
	head: ({ loaderData }) => {
		const page = loaderData?.posts.page ?? 1;
		const totalPages = loaderData?.posts.totalPages ?? 1;
		// Canonicalize junk/out-of-range ?page= values back to the index.
		const validPage = page > 1 && page <= totalPages;
		const url = validPage
			? `${SITE_URL}/blog?page=${page}`
			: `${SITE_URL}/blog`;
		const title = validPage
			? `Barbering & Beauty Blog — Page ${page} | Unicorn Barber Training Academy`
			: "Barbering & Beauty Blog | Unicorn Barber Training Academy";
		const description = validPage
			? `Page ${page} of fade guides, beauty career advice, and training insights from Unicorn Barber Training Academy in Dhaka.`
			: "Fade guides, beauty career advice, and training insights from Unicorn Barber Training Academy in Dhaka. Learn from working pros.";
		return {
			meta: [
				{ title },
				{ name: "description", content: description },
				{ name: "robots", content: "index, follow" },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
				{ property: "og:image", content: `${SITE_URL}/banner.png` },
				{
					property: "og:image:alt",
					content: "Unicorn Barber Training Academy banner",
				},
				{ name: "twitter:card", content: "summary_large_image" },
				{
					name: "twitter:title",
					content: title,
				},
				{ name: "twitter:description", content: description },
				{ name: "twitter:image", content: `${SITE_URL}/banner.png` },
			],
			links: [
				{ rel: "canonical", href: url },
				...(page > 1
					? [
							{
								rel: "prev",
								href:
									page === 2
										? `${SITE_URL}/blog`
										: `${SITE_URL}/blog?page=${page - 1}`,
							},
						]
					: []),
				...(page < totalPages
					? [{ rel: "next", href: `${SITE_URL}/blog?page=${page + 1}` }]
					: []),
			],
		};
	},
	component: BlogRoute,
});

function BlogRoute() {
	const { posts, categories } = Route.useLoaderData();
	const { page = 1 } = Route.useSearch();
	return <BlogPage posts={posts} categories={categories} page={page} />;
}
