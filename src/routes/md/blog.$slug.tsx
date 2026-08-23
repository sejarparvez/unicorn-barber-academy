// routes/md/blog.$slug.tsx
// GET /md/blog/:slug → text/markdown of a published post.
//
// AIO lever #1: GPTBot/ClaudeBot/PerplexityBot get the clean structured
// source with zero chrome. Linked from every post's <head> (rel=alternate
// text/markdown) and from llms.txt. Published posts only.
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { getPublishedBySlug } from "@/server/blog-db";

export const Route = createFileRoute("/md/blog/$slug")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const post = await getPublishedBySlug(params.slug);

				// Renamed? Permanent redirect preserves the indexed URL.
				if (!post) {
					const { getSlugRedirectTarget } = await import(
						"../../server/blog-db"
					);
					const toSlug = await getSlugRedirectTarget(params.slug);
					if (toSlug) {
						return new Response(null, {
							status: 301,
							headers: {
								location: `${SITE_URL}/md/blog/${toSlug}`,
								"x-robots-tag": "noindex",
							},
						});
					}
					return new Response("Not found", { status: 404 });
				}

				const front = [
					`# ${post.title}`,
					"",
					`- URL: ${SITE_URL}/blog/${post.slug}`,
					...(post.publishedAt
						? [
								`- Published: ${new Date(post.publishedAt).toISOString().slice(0, 10)}`,
							]
						: []),
					...(post.authorName ? [`- Author: ${post.authorName}`] : []),
					...(post.category ? [`- Category: ${post.category.name}`] : []),
					...(post.tags.length > 0 ? [`- Tags: ${post.tags.join(", ")}`] : []),
					...(post.excerpt ? ["", `> ${post.excerpt}`] : []),
				];

				const takeaways =
					post.keyTakeaways.length > 0
						? [
								"",
								"## Key takeaways",
								"",
								...post.keyTakeaways.map((t) => `- ${t}`),
							]
						: [];

				const faq =
					post.faq.length > 0
						? [
								"",
								"## Frequently asked questions",
								"",
								...post.faq.flatMap((item) => [
									`### ${item.q}`,
									"",
									item.a,
									"",
								]),
							]
						: [];

				const body = [
					...front,
					...takeaways,
					"",
					...(post.contentMd ?? "").split("\n"),
					...faq,
				].join("\n");

				return new Response(body, {
					status: 200,
					headers: {
						"content-type": "text/markdown; charset=utf-8",
						// Raw mirrors must never appear in search indexes — the
						// HTML page is the canonical document (robots.txt also
						// blocks /md/ for generic crawlers; AI crawlers are
						// unaffected by X-Robots-Tag and explicitly welcomed).
						"x-robots-tag": "noindex",
						// Posts change rarely once published; let CDNs cache briefly.
						"cache-control": "public, max-age=300",
					},
				});
			},
		},
	},
});
