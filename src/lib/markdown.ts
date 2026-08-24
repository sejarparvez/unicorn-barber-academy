// src/lib/markdown.ts
// Single markdown renderer for the blog, shared by the server (article SSR
// HTML) and the admin editor (live preview), so what editors see is exactly
// what crawlers get.
//
// marked parses; sanitize-html strips everything dangerous (script/iframe/
// event handlers/javascript: URLs). Admins are trusted-ish, but stored
// content is rendered to the public — sanitize anyway, always.
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

/** URL-safe anchor id matching src/lib/blog.ts slugify. */
function headingId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

const ALLOWED_TAGS = [
	...sanitizeHtml.defaults.allowedTags,
	"img",
	"h1",
	"h2",
	"figure",
	"figcaption",
	"del",
];

export function renderMarkdown(markdown: string): string {
	const html = marked.parse(markdown ?? "", { async: false });

	// The post title is the page's only <h1>. Authors who start their
	// markdown with "# Title" would otherwise emit a second one — demote
	// every authored H1 to H2 before anchors/ids are assigned.
	const demoted = html
		.replaceAll(/<h1(\s[^>]*)?>/g, "<h2$1>")
		.replaceAll("</h1>", "</h2>");

	// Anchor ids for deep links / featured snippets, deduped with -N
	// suffixes so repeated headings never collide.
	const seen = new Map<string, number>();
	const withAnchors = demoted.replace(
		/<h([23])>([\s\S]*?)<\/h\1>/g,
		(_match, level: string, inner: string) => {
			let id = headingId(inner.replace(/<[^>]+>/g, ""));
			if (id) {
				const n = seen.get(id) ?? 0;
				seen.set(id, n + 1);
				if (n > 0) id = `${id}-${n + 1}`;
			}
			return `<h${level}${id ? ` id="${id}"` : ""}>${inner}</h${level}>`;
		},
	);
	return sanitizeHtml(withAnchors, {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: {
			a: ["href", "title", "rel", "target"],
			img: ["src", "alt", "title", "loading", "decoding", "width", "height"],
			h1: ["id"],
			h2: ["id"],
			h3: ["id"],
			h4: ["id"],
			h5: ["id"],
			h6: ["id"],
		},
		transformTags: {
			// Never let authored links create new top-level browsing contexts
			// without rel hygiene. Protocol-relative hrefs ("//host") are
			// external too, so the check can't rely on a leading scheme.
			a: (tagName, attribs) => ({
				tagName,
				attribs: {
					...attribs,
					...(attribs.href?.includes("://") || attribs.href?.startsWith("//")
						? { rel: "noopener noreferrer nofollow" }
						: {}),
				},
			}),
			img: (tagName, attribs) => ({
				tagName,
				attribs: { ...attribs, loading: "lazy", decoding: "async" },
			}),
		},
	});
}
