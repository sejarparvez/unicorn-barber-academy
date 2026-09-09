// routes/blog.$slug.tsx
// Public article page + head() SEO. Published posts render for everyone;
// drafts render only for admin sessions (preview mode forces noindex).
// Markdown is rendered to sanitized HTML on the server — the client bundle
// never receives the raw body.
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ArticleSkeleton } from "@/components/route-skeletons";
import { SITE_URL } from "@/data/site";
import { PostDetailPage, PostNotFound } from "@/features/blog/post-detail-page";
import { getPostForPublicHtmlFn } from "@/server/blog/blog-fns";

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
			adjacent: result.adjacent,
		};
	},
	pendingComponent: ArticleSkeleton,
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
		const plainTitle = post.metaTitle || post.title;
		const title = `${plainTitle} | Unicorn Barber Training Academy`;
		const rawDescription = post.metaDescription || post.excerpt || undefined;
		// Keep SERP snippets clean: clamp editor-controlled copy to ~155 chars.
		const description =
			rawDescription && rawDescription.length > 155
				? `${rawDescription.slice(0, 152).trimEnd()}…`
				: rawDescription;
		const canonical = post.canonicalUrl || url;
		const image = post.ogImageUrl || post.coverImageUrl;
		const blocked = isPreview || post.noindex;

		return {
			meta: [
				{ title },
				...(description ? [{ name: "description", content: description }] : []),
				{
					name: "robots",
					content: blocked
						? "noindex"
						: "index, follow, max-image-preview:large",
				},
				{ property: "og:title", content: plainTitle },
				...(description
					? [{ property: "og:description", content: description }]
					: []),
				{ property: "og:type", content: "article" },
				{ property: "og:url", content: url },
				...(image ? [{ property: "og:image", content: image }] : []),
				...(image
					? [
							{
								property: "og:image:alt",
								content: post.coverImageAlt || plainTitle,
							},
						]
					: []),
				...(post.publishedAt
					? [{ property: "article:published_time", content: post.publishedAt }]
					: []),
				{
					property: "article:modified_time",
					content: post.updatedAt,
				},
				...(post.category
					? [{ property: "article:section", content: post.category.name }]
					: []),
				...[post.focusKeyword, ...post.tags]
					.filter((tag): tag is string => Boolean(tag))
					.map((tag) => ({ property: "article:tag", content: tag })),
				{
					property: "article:author",
					content: post.authorName || "Unicorn Barber Training Academy",
				},
				{
					property: "article:publisher",
					content: "Unicorn Barber Training Academy",
				},
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: plainTitle },
				...(description
					? [{ name: "twitter:description", content: description }]
					: []),
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
