import { createFileRoute, notFound } from '@tanstack/react-router';
import { PostDetailPage } from '@/components/pages/blog/post-detail';
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
			return {
				meta: [{ title: 'Post not found — Unicorn Barber Training Academy' }],
			};
		}

		const title = `${post.title} | Unicorn Barber Training Academy`;
		const description =
			post.excerpt ?? 'Read the latest from Unicorn Barber Training Academy.';

		return {
			meta: [
				{ title },
				{ name: 'description', content: description },
				{ property: 'og:type', content: 'article' },
				{ property: 'og:title', content: post.title },
				{ property: 'og:description', content: description },
				...(post.coverImage
					? [{ property: 'og:image', content: post.coverImage }]
					: []),
				...(post.publishedAt
					? [
							{
								property: 'article:published_time',
								content: post.publishedAt,
							},
						]
					: []),
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
