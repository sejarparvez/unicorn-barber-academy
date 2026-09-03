// src/lib/preview-markdown.ts
// Client-safe Markdown rendering for the admin editor's live preview.
//
// Deliberately SEPARATE from lib/markdown.ts: this module imports only
// `marked` — it must never import `sanitize-html` (a Node-only package) so
// it never drags fs/path/url/source-map-js into the browser bundle.
//
// Editor previews are the admin's own draft; the server sanitizes content
// on publish via lib/markdown.ts. Keeps the same parse/heading pipeline so
// previews match production output.
import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** URL-safe anchor id matching src/lib/blog.ts slugify. */
function headingId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Shared pipeline shared with the server renderer (lib/markdown.ts). */
export function transformMarkdown(markdown: string): string {
	const html = marked.parse(markdown ?? "", { async: false });

	// The post title is the page's only <h1>; demote authored H1 to H2.
	const demoted = html
		.replaceAll(/<h1(\s[^>]*)?>/g, "<h2$1>")
		.replaceAll("</h1>", "</h2>");

	// Anchor ids for deep links / featured snippets, deduped with -N.
	const seen = new Map<string, number>();
	return demoted.replace(
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
}

/**
 * Preview renderer for the admin editor ONLY — no sanitization. Never use
 * for anything served to visitors (see module docstring).
 */
export function renderMarkdownPreview(markdown: string): string {
	return transformMarkdown(markdown);
}
