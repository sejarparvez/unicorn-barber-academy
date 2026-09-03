// src/lib/markdown.ts
// Server-side Markdown rendering for the blog: marked + sanitize-html.
// Used by the public article page (SSR) so stored content is always
// sanitized before it reaches visitors.
//
// NOTE: this module imports Node-only `sanitize-html`, so it must NEVER be
// imported from client code. See `markdown-preview.ts` for the client-safe
// renderer used by the admin editor preview.
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { transformMarkdown } from "@/lib/preview-markdown";

marked.setOptions({ gfm: true, breaks: false });

const ALLOWED_TAGS = [
	...sanitizeHtml.defaults.allowedTags,
	"img",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"figure",
	"figcaption",
	"del",
];

export function renderMarkdown(markdown: string): string {
	const withAnchors = transformMarkdown(markdown);
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
