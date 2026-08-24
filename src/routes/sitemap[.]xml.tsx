// routes/[sitemap.xml].tsx
// GET /sitemap.xml — generated per request: static routes + program pages +
// every published blog post with its real lastmod. Dynamic so newly
// published posts are crawlable immediately (no manual regeneration step).
import { createFileRoute } from "@tanstack/react-router";
import { ALL_PROGRAMS } from "@/data/programs";
import { SITE_URL } from "@/data/site";
import {
	listCategoriesWithCounts,
	listRecentPublished,
} from "@/server/blog-db";

// Mirrors CATEGORY_MIN_INDEX_POSTS — thin archives stay out of the sitemap
// (they also ship meta robots noindex from their route).
const CATEGORY_MIN_INDEX_POSTS = 3;

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const [posts, categories] = await Promise.all([
					listRecentPublished(100),
					listCategoriesWithCounts(CATEGORY_MIN_INDEX_POSTS),
				]);

				const today = new Date().toISOString().slice(0, 10);
				// /enroll is intentionally absent: it sits behind sign-in and
				// redirects crawlers to the noindex auth page. Static routes omit
				// lastmod — a per-request "today" value is noise crawlers learn
				// to ignore (and Google then distrusts for every URL).
				const staticRoutes = [
					{ loc: "/", priority: "1.0" },
					{ loc: "/about", priority: "0.7" },
					{ loc: "/programs", priority: "0.9" },
					{ loc: "/instructors", priority: "0.7" },
					{ loc: "/gallery", priority: "0.6" },
					{ loc: "/student-life", priority: "0.6" },
					{ loc: "/media", priority: "0.5" },
					{ loc: "/blog", lastmod: today, priority: "0.7" },
					{ loc: "/contact", priority: "0.8" },
					{ loc: "/careers", priority: "0.5" },
					{ loc: "/terms", priority: "0.2" },
					{ loc: "/privacy", priority: "0.2" },
				];

				const entries: Array<{
					loc: string;
					lastmod?: string;
					priority: string;
				}> = [
					...staticRoutes,
					...ALL_PROGRAMS.map((p) => ({
						loc: p.to,
						priority: "0.8",
					})),
					...categories.map((c) => ({
						loc: `/blog/category/${c.slug}`,
						lastmod: today,
						priority: "0.5",
					})),
					...posts.map((post) => ({
						loc: `/blog/${post.slug}`,
						lastmod: post.updatedAt.slice(0, 10),
						priority: "0.6",
					})),
				];

				const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(entry) => `  <url>
    <loc>${SITE_URL}${entry.loc === "/" ? "" : entry.loc}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""}${entry.loc.startsWith("/blog/") ? "    <changefreq>monthly</changefreq>\n" : ""}    <priority>${entry.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>`;

				return new Response(xml, {
					status: 200,
					headers: {
						"content-type": "application/xml; charset=utf-8",
						"cache-control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
