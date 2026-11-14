import type { MetaDescriptor } from '@tanstack/react-router';
import type {
	DetailedHTMLProps,
	LinkHTMLAttributes,
	MetaHTMLAttributes,
} from 'react';
import { SITE } from './site';

/* ------------------------------- URLs ---------------------------------- */

/** Absolute, normalized URL for a site path (or pass through a full URL). */
export function absoluteUrl(path = '/'): string {
	if (/^https?:\/\//i.test(path)) {
		return path;
	}
	return `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Canonical URL for a path, stripping trailing slashes and tracking params. */
export function canonicalUrl(path: string): string {
	const [pathname, query] = path.split('?');
	const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
	const safeQuery = query
		? `?${query
				.split('&')
				.filter((part) => !/^(utm_|gclid|fbclid)/i.test(part))
				.join('&')}`
		: '';
	return absoluteUrl(`${cleanPath}${safeQuery}`);
}

/* ----------------------------- Text helpers ----------------------------- */

/** Collapse whitespace and keep meta descriptions within the useful range. */
export function metaDescription(text: string, max = 158): string {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (clean.length <= max) {
		return clean;
	}
	const slice = clean.slice(0, max - 1);
	// Prefer ending on a complete sentence when one finishes late enough to be
	// useful, so search snippets do not cut mid-thought.
	const sentenceEnd = Math.max(
		slice.lastIndexOf('. '),
		slice.lastIndexOf('! '),
		slice.lastIndexOf('? '),
	);
	if (sentenceEnd >= 80) {
		return slice.slice(0, sentenceEnd + 1).trim();
	}
	const lastSpace = slice.lastIndexOf(' ');
	const cut = lastSpace > 60 ? slice.slice(0, lastSpace) : slice;
	return `${cut.trimEnd().replace(/[,.;:–-]$/, '')}…`;
}

/* ------------------------------ Page SEO -------------------------------- */

export type JsonLdObject = Record<string, unknown>;

export type PageSeoOptions = {
	/** Full `<title>` (50–60 characters reads best in search results). */
	title: string;
	description: string;
	/** Site-relative path, e.g. `/programs/classic-barbering`. */
	path: string;
	image?: string | null;
	imageAlt?: string;
	type?: 'website' | 'article' | 'profile';
	/** Set to true for auth, account, checkout and other non-indexable pages. */
	noindex?: boolean;
	keywords?: string[];
	publishedTime?: string;
	modifiedTime?: string;
	articleSection?: string;
	tags?: string[];
	authors?: string[];
	jsonLd?: JsonLdObject | JsonLdObject[];
};

/**
 * The head option on file routes expects React DOM prop types, while the
 * runtime also understands TanStack's `script:ld+json` meta descriptor. We
 * build the richer descriptor shape and widen it at the boundary.
 */
type HeadMeta = DetailedHTMLProps<
	MetaHTMLAttributes<HTMLMetaElement>,
	HTMLMetaElement
>;
type HeadLink = DetailedHTMLProps<
	LinkHTMLAttributes<HTMLLinkElement>,
	HTMLLinkElement
>;

export type PageSeoResult = {
	meta: HeadMeta[];
	links: HeadLink[];
};

const INDEXABLE_ROBOTS =
	'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

/**
 * Builds the complete head payload for a public page: title, description,
 * canonical, robots, Open Graph, Twitter cards and JSON-LD. TanStack Router
 * dedupes meta by `name`/`property` (child wins), so a route can safely
 * override any default set by the root layout.
 */
export function pageSeo({
	title,
	description,
	path,
	image,
	imageAlt,
	type = 'website',
	noindex = false,
	keywords,
	publishedTime,
	modifiedTime,
	articleSection,
	tags,
	authors,
	jsonLd,
}: PageSeoOptions): PageSeoResult {
	const url = canonicalUrl(path);
	const resolvedImage = absoluteUrl(image || SITE.defaultOgImage);
	const usesDefaultImage = !image;
	const descriptionText = metaDescription(description);
	const jsonLdEntries = (
		Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []
	).map((entry) => ({ 'script:ld+json': entry }) satisfies MetaDescriptor);

	const meta: MetaDescriptor[] = [
		{ title },
		{ name: 'description', content: descriptionText },
		{
			name: 'robots',
			content: noindex ? 'noindex, nofollow' : INDEXABLE_ROBOTS,
		},
		{ property: 'og:type', content: type },
		{ property: 'og:title', content: title },
		{ property: 'og:description', content: descriptionText },
		{ property: 'og:url', content: url },
		{ property: 'og:image', content: resolvedImage },
		{
			property: 'og:image:alt',
			content: imageAlt ?? `${SITE.name} — ${SITE.tagline}`,
		},
		...(usesDefaultImage
			? [
					{ property: 'og:image:width', content: '1200' },
					{ property: 'og:image:height', content: '630' },
				]
			: []),
		{ name: 'twitter:card', content: 'summary_large_image' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: descriptionText },
		{ name: 'twitter:image', content: resolvedImage },
		{ name: 'twitter:image:alt', content: imageAlt ?? SITE.name },
		...(keywords?.length
			? [{ name: 'keywords', content: keywords.join(', ') }]
			: []),
		...(publishedTime
			? [{ property: 'article:published_time', content: publishedTime }]
			: []),
		...(modifiedTime
			? [{ property: 'article:modified_time', content: modifiedTime }]
			: []),
		...(articleSection
			? [{ property: 'article:section', content: articleSection }]
			: []),
		...(tags ?? []).map((tag) => ({
			property: 'article:tag',
			content: tag,
		})),
		...(authors ?? []).map((author) => ({
			name: 'author',
			content: author,
		})),
		...jsonLdEntries,
	];

	return {
		meta: meta as unknown as HeadMeta[],
		links: [
			{ rel: 'canonical', href: url },
			{ rel: 'alternate', hrefLang: 'en', href: url },
			{ rel: 'alternate', hrefLang: 'x-default', href: url },
		],
	};
}

/** Convenience: a link tag that points answer engines at the site's LLM brief. */
export const LLMS_TXT_LINK = {
	rel: 'alternate',
	type: 'text/markdown',
	href: '/llms.txt',
} as const;
