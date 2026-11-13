// Server-side Markdown rendering for the blog: marked + sanitize-html.
// Used by the public article loader so stored content is always sanitized
// before it reaches visitors.
//
// NOTE: this module imports the Node-only `sanitize-html` package, so it must
// never be imported from client code. The admin editor preview uses the
// client-safe renderer in `src/components/pages/dashboard/blog/markdown-preview.ts`.
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { transformMarkdown } from '@/components/pages/dashboard/blog/markdown-preview';

marked.setOptions({ gfm: true, breaks: false });

const ALLOWED_TAGS = [
	...sanitizeHtml.defaults.allowedTags,
	'img',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'figure',
	'figcaption',
	'del',
];

export function renderMarkdown(markdown: string): string {
	return sanitizeHtml(transformMarkdown(markdown), {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: {
			a: ['href', 'title', 'rel', 'target'],
			div: ['class'],
			img: ['src', 'alt', 'title', 'loading', 'decoding', 'width', 'height'],
			h1: ['id'],
			h2: ['id'],
			h3: ['id'],
			h4: ['id'],
			h5: ['id'],
			h6: ['id'],
		},
		allowedSchemes: ['http', 'https', 'mailto', 'tel'],
		allowedSchemesByTag: {
			img: ['http', 'https', 'data'],
		},
		allowProtocolRelative: false,
		transformTags: {
			// Never let authored links create new browsing contexts without rel
			// hygiene. Protocol-relative hrefs ("//host") are external too, so the
			// check can't rely on a leading scheme.
			a: (tagName, attribs) => ({
				tagName,
				attribs: {
					...attribs,
					...(attribs.href?.includes('://') || attribs.href?.startsWith('//')
						? { rel: 'noopener noreferrer nofollow' }
						: {}),
				},
			}),
			img: (tagName, attribs) => {
				// Block non-image data: URIs (e.g. data:text/html) on images.
				const src = attribs.src ?? '';
				const cleanSrc =
					src.startsWith('data:') && !src.startsWith('data:image/') ? '' : src;
				return {
					tagName,
					attribs: {
						...attribs,
						src: cleanSrc,
						loading: 'lazy',
						decoding: 'async',
					},
				};
			},
		},
	});
}
