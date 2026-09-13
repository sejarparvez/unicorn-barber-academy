// src/lib/sanitize-client.ts
// Client-safe HTML sanitizer for admin previews (DOMPurify). Must stay
// equal-or-stricter than the server renderer in lib/markdown.ts.
import DOMPurify from "dompurify";

export function sanitizePreviewHtml(dirty: string): string {
	return DOMPurify.sanitize(dirty, {
		ALLOWED_TAGS: [
			"h2",
			"h3",
			"h4",
			"p",
			"a",
			"ul",
			"ol",
			"li",
			"strong",
			"em",
			"code",
			"pre",
			"blockquote",
			"img",
			"figure",
			"figcaption",
			"table",
			"thead",
			"tbody",
			"tr",
			"th",
			"td",
			"hr",
			"br",
			"del",
			"div",
		],
		ALLOWED_ATTR: [
			"href",
			"title",
			"rel",
			"target",
			"src",
			"alt",
			"loading",
			"decoding",
			"id",
			"class",
		],
		ALLOW_DATA_ATTR: false,
		FORBID_ATTR: ["onerror", "onload", "onclick", "style"],
	});
}
