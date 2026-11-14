import { createFileRoute, notFound } from '@tanstack/react-router';
import { BlogIndex } from '@/components/pages/blog/blog-index';
import {
	POST_CATEGORY_LABELS,
	POST_CATEGORY_VALUES,
	type PostCategory,
} from '@/components/pages/blog/types';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getPostCategoryCounts, getPublishedPosts } from '@/server/posts';

type BlogSearch = { page?: number; category?: PostCategory };

const CATEGORY_DESCRIPTIONS: Record<PostCategory, string> = {
	barbering:
		'Barbering techniques, tool guides and shop-floor advice from the educators at Unicorn Barber Training Academy in Dhaka.',
	styling:
		'Hair styling techniques, trends and professional advice from the team at Unicorn Barber Training Academy in Dhaka.',
	makeup:
		'Makeup techniques, product guides and bridal looks from the artists at Unicorn Barber Training Academy in Dhaka.',
	career:
		'Career advice for barbers, stylists and makeup artists — portfolios, interviews, pricing and salon work in Bangladesh.',
	academy_news:
		'News, cohort announcements and student stories from Unicorn Barber Training Academy in Banasree, Dhaka.',
};

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
		category: isCategory(search.category) ? search.category : undefined,
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
	head: ({ loaderData, match }) => {
		const posts = loaderData?.posts;
		const page = posts?.page ?? 1;
		const category = isCategory(match.search.category)
			? match.search.category
			: undefined;
		const categoryLabel = category ? POST_CATEGORY_LABELS[category] : null;

		const title = categoryLabel
			? `${categoryLabel} Articles & Guides | Unicorn Barber Academy`
			: page > 1
				? `Blog — Page ${page} | Unicorn Barber Training Academy`
				: 'Barbering & Beauty Blog | Unicorn Barber Academy, Dhaka';

		const description = category
			? CATEGORY_DESCRIPTIONS[category]
			: 'Techniques, tool talk and career advice from the barbers and educators at Unicorn Barber Training Academy in Banasree, Dhaka.';

		const params = new URLSearchParams();
		if (category) {
			params.set('category', category);
		}
		if (page > 1) {
			params.set('page', String(page));
		}
		const query = params.toString();
		const path = query ? `/blog?${query}` : '/blog';

		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Blog', path: '/blog' },
			...(categoryLabel
				? [{ name: categoryLabel, path: `/blog?category=${category}` }]
				: []),
		]);

		const seo = pageSeo({
			title,
			description,
			path,
			keywords: [
				'barbering blog',
				'beauty training tips',
				...(categoryLabel ? [categoryLabel] : []),
				'Dhaka',
			],
			jsonLd: [
				webPageSchema({
					type: 'CollectionPage',
					name: title,
					description,
					path,
					breadcrumb,
				}),
				...(posts?.items.length
					? [
							itemListSchema({
								name: title,
								path,
								items: posts.items.map((post) => ({
									name: post.title,
									path: `/blog/${post.slug}`,
									...(post.excerpt ? { description: post.excerpt } : {}),
								})),
							}),
						]
					: []),
			],
		});

		return {
			...seo,
			links: [
				...seo.links,
				{ rel: 'alternate', type: 'application/rss+xml', href: '/rss.xml' },
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
