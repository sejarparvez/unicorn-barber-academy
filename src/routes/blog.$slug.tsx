// routes/blog.$slug.tsx
// Public article page + head() SEO. Published posts render for everyone;
// drafts render only for admin sessions (preview mode forces noindex).
// Markdown is rendered to sanitized HTML on the server — the client bundle
// never receives the raw body.
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { PostDetailPage, PostNotFound } from "@/features/blog/post-detail-page";
import { getPostForPublicHtmlFn } from "@/server/blog-fns";

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ params }) => {
		const result = await getPostForPublicHtmlFn({
			data: { slug: params.slug },
		});

		if (result.kind === "redirect") {
			// Renamed slug: permanent redirect preserves accumulated rankings.
			throw redirect({
				to: "/blog/$slug",
				params: { slug: result.toSlug },
				replace: true,
				statusCode: 301,
			});
		}
		if (result.kind === "missing") throw notFound();

		return {
			post: result.post,
			isPreview: result.isPreview,
			relatedPosts: result.relatedPosts,
		};
	},
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{ title: "Article not found | Unicorn Barber Training Academy" },
					{ name: "robots", content: "noindex" },
				],
			};
		}
		const { post, isPreview } = loaderData;
		const url = `${SITE_URL}/blog/${post.slug}`;
		const title = `${post.metaTitle || post.title} | Unicorn Barber Training Academy`;
		const description = post.metaDescription || post.excerpt || undefined;
		const canonical = post.canonicalUrl || url;
		const image = post.ogImageUrl || post.coverImageUrl;
		const blocked = isPreview || post.noindex;

		return {
			meta: [
				{ title },
				...(description ? [{ name: "description", content: description }] : []),
				...(blocked ? [{ name: "robots", content: "noindex" }] : []),
				{ property: "og:title", content: title },
				...(description
					? [{ property: "og:description", content: description }]
					: []),
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: url },
				...(image ? [{ property: "og:image", content: image }] : []),
				...(post.publishedAt
					? [{ property: "article:published_time", content: post.publishedAt }]
					: []),
				{
					property: "article:modified_time",
					content: post.updatedAt,
				},
				...[post.focusKeyword, ...post.tags]
					.filter((tag): tag is string => Boolean(tag))
					.map((tag) => ({ property: "article:tag", content: tag })),
				{ name: "twitter:card", content: "summary_large_image" },
				...(image ? [{ name: "twitter:image", content: image }] : []),
			],
			links: [
				{ rel: "canonical", href: canonical },
				// Machine-readable source of truth for AI crawlers (llms.txt points here).
				{
					rel: "alternate",
					type: "text/markdown",
					href: `${SITE_URL}/md/blog/${post.slug}`,
				},
			],
		};
	},
	component: PostDetailPage,
	notFoundComponent: PostNotFound,
});
