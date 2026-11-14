/**
 * Client-safe blog domain types and pure helpers. Server modules and UI
 * components share these so database values never leak across the boundary
 * untyped, and dates always cross as ISO strings.
 */

export const POST_CATEGORY_VALUES = [
	'barbering',
	'styling',
	'makeup',
	'career',
	'academy_news',
] as const;

export type PostCategory = (typeof POST_CATEGORY_VALUES)[number];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
	barbering: 'Barbering',
	styling: 'Styling',
	makeup: 'Makeup',
	career: 'Career',
	academy_news: 'Academy news',
};

export const POST_CATEGORY_OPTIONS = POST_CATEGORY_VALUES.map((value) => ({
	value,
	label: POST_CATEGORY_LABELS[value],
}));

export const POST_STATUS_VALUES = ['draft', 'published'] as const;
export type PostStatus = (typeof POST_STATUS_VALUES)[number];

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
	draft: 'Draft',
	published: 'Published',
};

export const POST_STATUS_OPTIONS = POST_STATUS_VALUES.map((value) => ({
	value,
	label: POST_STATUS_LABELS[value],
}));

/** Listing/card projection — the article body is never shipped to the client. */
export type PostSummary = {
	id: string;
	slug: string;
	title: string;
	excerpt: string | null;
	coverImage: string | null;
	coverImageAlt: string | null;
	category: PostCategory;
	tags: string[];
	featured: boolean;
	readingMinutes: number;
	/** ISO date string, or null while the post is still a draft. */
	publishedAt: string | null;
};

/** A full published article for the detail page. */
export type PostDetail = PostSummary & {
	/** Sanitized HTML, rendered from the stored Markdown on the server. */
	bodyHtml: string;
	authorName: string;
	updatedAt: string;
};

/** A heading pulled from a rendered article, used to build the table of contents. */
export type PostHeading = { id: string; text: string; level: 2 | 3 };

export type PaginatedPosts = {
	items: PostSummary[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

/* ------------------------------ helpers -------------------------------- */

/** URL-safe slug from arbitrary title text. */
export function slugify(input: string): string {
	return input
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 160);
}

/** Words/200 reading-time heuristic, minimum one minute. */
export function estimateReadingMinutes(markdown: string): number {
	const words = markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/[#*_>`~[\]()!-]/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

/** Derives an excerpt from the raw Markdown when the editor leaves it blank. */
export function deriveExcerpt(markdown: string): string | null {
	const text = markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*_>`~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!text) {
		return null;
	}
	return text.length <= 200 ? text : `${text.slice(0, 199).trimEnd()}…`;
}

/** Formats an ISO date for bylines, e.g. 12 Nov 2026. */
export function formatPostDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

const HTML_ENTITIES: Record<string, string> = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&apos;': "'",
	'&nbsp;': ' ',
};

function decodeEntities(value: string): string {
	return value.replace(
		/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g,
		(m) => HTML_ENTITIES[m] ?? m,
	);
}

/**
 * Pulls the H2/H3 headings out of rendered article HTML to build the table of
 * contents. Anchors are added server-side by `transformMarkdown`, so headings
 * without an `id` are skipped. Pure string work — safe on the server and client.
 */
export function extractHeadings(html: string): PostHeading[] {
	const headings: PostHeading[] = [];
	const pattern = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;

	for (const match of html.matchAll(pattern)) {
		const level = Number(match[1]) as 2 | 3;
		const id = match[2];
		const text = decodeEntities(match[3].replace(/<[^>]+>/g, '')).trim();
		if (id && text) {
			headings.push({ id, text, level });
		}
	}

	return headings;
}
