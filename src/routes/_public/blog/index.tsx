import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogIndex } from '@/components/pages/blog/blog-index';
import {
	POST_CATEGORY_VALUES,
	type PostCategory,
} from '@/components/pages/blog/types';
import { getPostCategoryCounts, getPublishedPosts } from '@/server/posts';

type BlogSearch = { page?: number; category?: PostCategory };

function isCategory(value: unknown): value is PostCategory {
	return (
		typeof value === 'string' &&
		(POST_CATEGORY_VALUES as readonly string[]).includes(value)
	);
}

export const Route = createFileRoute('/_public/blog/')({
	validateSearch: (search: Record<string, unknown>): BlogSearch => {
		const page = Number.parseInt(String(search.page ?? ''), 10);
		return {
			...(Number.isInteger(page) && page > 1 ? { page } : {}),
			...(isCategory(search.category) ? { category: search.category } : {}),
		};
	},
	loaderDeps: ({ search }) => ({
		page: search.page,
		category: search.category,
	}),
	loader: async ({ deps }) => {
		const [posts, categoryCounts] = await Promise.all([
			getPublishedPosts({
				data: { page: deps.page ?? 1, category: deps.category },
			}),
			getPostCategoryCounts(),
		]);

		// An out-of-range ?page= is a bad URL, not an empty blog.
		if (deps.page && deps.page > posts.totalPages) {
			throw notFound();
		}

		return { posts, categoryCounts };
	},
	head: ({ loaderData }) => {
		const page = loaderData?.posts.page ?? 1;
		return {
			meta: [
				{
					title:
						page > 1
							? `Blog — Page ${page} | Unicorn Barber Training Academy`
							: 'Blog | Unicorn Barber Training Academy',
				},
				{
					name: 'description',
					content:
						'Techniques, tool talk and career advice from the barbers and educators at Unicorn Barber Training Academy in Banasree, Dhaka.',
				},
			],
		};
	},
	component: BlogRoute,
});

function BlogRoute() {
	const { posts, categoryCounts } = Route.useLoaderData();
	const { page = 1, category } = Route.useSearch();

	return (
		<BlogIndex
			posts={posts}
			categoryCounts={categoryCounts}
			activeCategory={category}
			page={page}
		/>
	);
}
