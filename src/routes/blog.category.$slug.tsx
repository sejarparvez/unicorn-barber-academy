// routes/blog.category.$slug.tsx
// Category archive. Indexable only once the category has enough posts to
// avoid thin-content signals (head() flips to noindex below the threshold);
// sitemap inclusion mirrors the same rule.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import {
	CATEGORY_MIN_INDEX_POSTS,
	CategoryArchivePage,
} from "@/features/blog/category-archive-page";
import { getCategoryArchiveFn } from "@/server/blog-fns";

type ArchiveSearch = { page?: number };

export const Route = createFileRoute("/blog/category/$slug")({
	validateSearch: (search: Record<string, unknown>): ArchiveSearch => {
		const page = Number.parseInt(String(search.page ?? ""), 10);
		return Number.isInteger(page) && page > 1 ? { page } : {};
	},
	loader: async ({ params, location }) => {
		const search = location.search as ArchiveSearch;
		const result = await getCategoryArchiveFn({
			data: { slug: params.slug, page: search.page ?? 1 },
		});
		if (!result) throw notFound();
		return result;
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{ title: "Category not found | Unicorn Barber Training Academy" },
					{ name: "robots", content: "noindex" },
				],
			};
		}
		const { category, posts } = loaderData;
		const page = posts.page ?? 1;
		const url =
			page > 1
				? `${SITE_URL}/blog/category/${category.slug}?page=${page}`
				: `${SITE_URL}/blog/category/${category.slug}`;
		const indexable = posts.total >= CATEGORY_MIN_INDEX_POSTS;

		return {
			meta: [
				{
					title:
						page > 1
							? `${category.name} — Blog (page ${page}) | Unicorn Barber Training Academy`
							: `${category.name} — Blog | Unicorn Barber Training Academy`,
					description: `Articles on ${category.name.toLowerCase()} from Unicorn Barber Training Academy in Dhaka.`,
				},
				// Thin archives stay out of the index until they earn it.
				...(indexable ? [] : [{ name: "robots", content: "noindex" as const }]),
				{ property: "og:title", content: `${category.name} — Blog` },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	component: CategoryRoute,
	notFoundComponent: CategoryNotFound,
});

function CategoryRoute() {
	const { category, posts } = Route.useLoaderData();
	const { page = 1 } = Route.useSearch();
	return <CategoryArchivePage category={category} posts={posts} page={page} />;
}

function CategoryNotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-32 text-center">
			<h1 className="font-heading text-3xl font-medium text-foreground">
				Category not found
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				This collection doesn&rsquo;t exist.
			</p>
			<Link
				to="/blog"
				className="mt-8 inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
			>
				BACK TO THE JOURNAL
			</Link>
		</main>
	);
}
