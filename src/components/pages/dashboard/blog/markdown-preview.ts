// Client-safe Markdown rendering for the admin editor's live preview.
//
// Deliberately separate from `src/server/markdown.ts`: this module imports only
// `marked`, never the Node-only `sanitize-html`, so it can run in the browser.
// The public article page renders and sanitizes server-side; the shared
// `transformMarkdown` keeps previews matching production output.
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/** URL-safe anchor id matching the blog `slugify` helper. */
function headingId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Shared pipeline used by both the preview and the server renderer. */
export function transformMarkdown(markdown: string): string {
	const html = marked.parse(markdown ?? '', { async: false });

	// The post title is the page's only <h1>; demote authored H1 to H2.
	const demoted = html
		.replaceAll(/<h1(\s[^>]*)?>/g, '<h2$1>')
		.replaceAll('</h1>', '</h2>');

	// Anchor ids for deep links, deduped with a -N suffix.
	const seen = new Map<string, number>();
	const anchored = demoted.replace(
		/<h([23])>([\s\S]*?)<\/h\1>/g,
		(_match, level: string, inner: string) => {
			let id = headingId(inner.replace(/<[^>]+>/g, ''));
			if (id) {
				const n = seen.get(id) ?? 0;
				seen.set(id, n + 1);
				if (n > 0) {
					id = `${id}-${n + 1}`;
				}
			}
			return `<h${level}${id ? ` id="${id}"` : ''}>${inner}</h${level}>`;
		},
	);

	// Wide tables scroll inside their own container instead of overflowing.
	return anchored
		.replace(/<table(\s[^>]*)?>/g, '<div class="overflow-x-auto"><table$1>')
		.replaceAll('</table>', '</table></div>');
}

/**
 * Preview renderer for the admin editor ONLY — no sanitization. Never use for
 * anything served to visitors (see `src/server/markdown.ts`).
 */
export function renderMarkdownPreview(markdown: string): string {
	return transformMarkdown(markdown);
}
