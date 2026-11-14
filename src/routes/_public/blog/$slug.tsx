import { createFileRoute, notFound } from '@tanstack/react-router';
import { PostDetailPage } from '@/components/pages/blog/post-detail';
import { POST_CATEGORY_LABELS } from '@/components/pages/blog/types';
import { articleSchema, breadcrumbSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getPublishedPostBySlug } from '@/server/posts';

export const Route = createFileRoute('/_public/blog/$slug')({
	loader: async ({ params }) => {
		const result = await getPublishedPostBySlug({
			data: { slug: params.slug },
		});

		if (!result) {
			throw notFound();
		}

		return result;
	},
	head: ({ loaderData }) => {
		const post = loaderData?.post;

		if (!post) {
			return pageSeo({
				title: 'Post not found | Unicorn Barber Training Academy',
				description: 'This article could not be found.',
				path: '/blog',
				noindex: true,
			});
		}

		const path = `/blog/${post.slug}`;
		const title = `${post.title} | Unicorn Academy`;
		const description =
			post.excerpt ??
			`Read ${post.title} from Unicorn Barber Training Academy.`;
		const section = POST_CATEGORY_LABELS[post.category];

		const seo = pageSeo({
			title,
			description,
			path,
			type: 'article',
			image: post.coverImage,
			imageAlt: post.coverImageAlt ?? post.title,
			publishedTime: post.publishedAt ?? undefined,
			modifiedTime: post.updatedAt,
			articleSection: section,
			tags: post.tags,
			authors: [post.authorName],
			keywords: [
				section,
				...(post.tags ?? []),
				'barbering',
				'beauty training',
				'Dhaka',
			],
			jsonLd: [
				articleSchema(post, path),
				breadcrumbSchema([
					{ name: 'Home', path: '/' },
					{ name: 'Blog', path: '/blog' },
					{
						name: section,
						path: `/blog?category=${post.category}`,
					},
					{ name: post.title, path },
				]),
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
	component: PostRoute,
});

function PostRoute() {
	const { post, related, newer, older } = Route.useLoaderData();

	return (
		<PostDetailPage post={post} related={related} newer={newer} older={older} />
	);
}
