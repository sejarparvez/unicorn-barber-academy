// routes/feed[.]xml.tsx
// GET /feed.xml — RSS 2.0 feed of published posts. Discovery channel for
// readers and AI aggregators alike; kept in sync with the sitemap route.
// noindex posts are excluded: syndication surfaces must not circulate URLs
// that carry meta robots noindex.
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { listPublishedPosts } from "@/server/blog-db";

function xmlEscape(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/feed.xml")({
	server: {
		handlers: {
			GET: async () => {
				const { items } = await listPublishedPosts({
					page: 1,
					perPage: 20,
					excludeNoindex: true,
				});

				const entries = items.map((post) => {
					const url = `${SITE_URL}/blog/${post.slug}`;
					const md = `${SITE_URL}/md/blog/${post.slug}`;
					const description = post.excerpt
						? `${post.excerpt}\nRaw markdown: ${md}`
						: `Raw markdown: ${md}`;
					return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
${post.publishedAt ? `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>\n` : ""}      <description>${xmlEscape(description)}</description>
${post.category ? `      <category>${xmlEscape(post.category.name)}</category>\n` : ""}    </item>`;
				});

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Unicorn Barber Training Academy — The Journal</title>
    <link>${SITE_URL}/blog</link>
    <description>Barbering technique, beauty careers, and professional training in Dhaka.</description>
    <language>en-bd</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link rel="self" type="application/rss+xml" href="${SITE_URL}/feed.xml"/>
${entries.join("\n")}
  </channel>
</rss>`;

				return new Response(xml, {
					status: 200,
					headers: {
						"content-type": "application/rss+xml; charset=utf-8",
						"cache-control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
