import { db } from '@/lib/db';
import { absoluteUrl } from '@/lib/seo';
import { SITE } from '@/lib/site';

/* ------------------------------ Content -------------------------------- */

export type SeoProgram = {
	slug: string;
	title: string;
	tagline: string;
	description: string;
	level: string;
	duration: string;
	price: number;
	updatedAt: string;
};

export type SeoPost = {
	slug: string;
	title: string;
	excerpt: string | null;
	tags: string[];
	publishedAt: string | null;
	updatedAt: string;
};

export type SeoContent = {
	programs: SeoProgram[];
	posts: SeoPost[];
};

/** Loads the public catalogue once for sitemap.xml, rss.xml and llms.txt. */
export async function getSeoContent(): Promise<SeoContent> {
	const [programs, posts] = await Promise.all([
		db.program.findMany({
			where: { hidden: false },
			orderBy: { position: 'asc' },
			select: {
				slug: true,
				title: true,
				tagline: true,
				description: true,
				level: true,
				duration: true,
				price: true,
				updatedAt: true,
			},
		}),
		db.post.findMany({
			where: { status: 'published' },
			orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
			select: {
				slug: true,
				title: true,
				excerpt: true,
				tags: true,
				publishedAt: true,
				updatedAt: true,
			},
		}),
	]);

	return {
		programs: programs.map((program) => ({
			slug: program.slug,
			title: program.title,
			tagline: program.tagline,
			description: program.description,
			level: program.level,
			duration: program.duration,
			price: program.price,
			updatedAt: program.updatedAt.toISOString(),
		})),
		posts: posts.map((post) => ({
			slug: post.slug,
			title: post.title,
			excerpt: post.excerpt,
			tags: post.tags,
			publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
			updatedAt: post.updatedAt.toISOString(),
		})),
	};
}

/* ------------------------------- Sitemap -------------------------------- */

type SitemapEntry = {
	path: string;
	lastModified?: string;
	changeFrequency?:
		| 'always'
		| 'hourly'
		| 'daily'
		| 'weekly'
		| 'monthly'
		| 'yearly'
		| 'never';
	priority?: number;
};

const STATIC_PAGES: SitemapEntry[] = [
	{ path: '/', changeFrequency: 'weekly', priority: 1 },
	{ path: '/programs', changeFrequency: 'weekly', priority: 0.9 },
	{ path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
	{ path: '/about', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
	{ path: '/instructors', changeFrequency: 'monthly', priority: 0.6 },
	{ path: '/gallery', changeFrequency: 'weekly', priority: 0.6 },
	{ path: '/verify', changeFrequency: 'monthly', priority: 0.5 },
	{ path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
	{ path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
];

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function renderSitemapXml(content: SeoContent): string {
	const entries: SitemapEntry[] = [
		...STATIC_PAGES,
		...content.programs.map((program) => ({
			path: `/programs/${program.slug}`,
			lastModified: program.updatedAt,
			changeFrequency: 'monthly' as const,
			priority: 0.8,
		})),
		...content.posts.map((post) => ({
			path: `/blog/${post.slug}`,
			lastModified: post.updatedAt,
			changeFrequency: 'monthly' as const,
			priority: 0.7,
		})),
	];

	const urls = entries
		.map((entry) => {
			const lines = [`    <loc>${escapeXml(absoluteUrl(entry.path))}</loc>`];
			if (entry.lastModified) {
				lines.push(`    <lastmod>${entry.lastModified}</lastmod>`);
			}
			if (entry.changeFrequency) {
				lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
			}
			if (entry.priority !== undefined) {
				lines.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
			}
			return `  <url>\n${lines.join('\n')}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/* ------------------------------- robots.txt ----------------------------- */

const PRIVATE_PATHS = [
	'/dashboard',
	'/auth/',
	'/enroll',
	'/certificates/',
	'/api/',
];

/** Answer engines and LLM crawlers we explicitly welcome (GEO). */
const AI_CRAWLERS = [
	'GPTBot',
	'OAI-SearchBot',
	'ChatGPT-User',
	'ClaudeBot',
	'Claude-Web',
	'anthropic-ai',
	'PerplexityBot',
	'Perplexity-User',
	'Google-Extended',
	'Applebot-Extended',
	'CCBot',
];

export function renderRobotsTxt(): string {
	const privateRules = PRIVATE_PATHS.map((path) => `Disallow: ${path}`).join(
		'\n',
	);

	const aiGroups = AI_CRAWLERS.map(
		(bot) => `User-agent: ${bot}\nAllow: /\n${privateRules}`,
	).join('\n\n');

	return `# robots.txt for ${SITE.name}
# Public content is open to search engines, answer engines and LLM crawlers.

User-agent: *
Allow: /
${privateRules}

${aiGroups}

Sitemap: ${absoluteUrl('/sitemap.xml')}
`;
}

/* --------------------------------- RSS ---------------------------------- */

function toRfc822(iso: string | null): string {
	return new Date(iso ?? Date.now()).toUTCString();
}

export function renderRssFeed(content: SeoContent): string {
	const items = content.posts
		.map((post) => {
			const url = absoluteUrl(`/blog/${post.slug}`);
			return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822(post.publishedAt)}</pubDate>
      <description>${escapeXml(post.excerpt ?? post.title)}</description>
${post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join('\n')}
    </item>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Blog</title>
    <link>${escapeXml(absoluteUrl('/blog'))}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(absoluteUrl('/rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

/* ------------------------------- llms.txt ------------------------------- */

/**
 * A concise, curated brief for LLMs and answer engines, following the
 * llmstxt.org convention: facts first, then links with one-line summaries.
 */
export function renderLlmsTxt(content: SeoContent): string {
	const programLines = content.programs
		.map(
			(program) =>
				`- [${program.title}](${absoluteUrl(`/programs/${program.slug}`)}): ${program.tagline} Level: ${program.level}; duration: ${program.duration}; fee: ৳${program.price.toLocaleString('en-US')}.`,
		)
		.join('\n');

	const postLines = content.posts
		.slice(0, 15)
		.map(
			(post) =>
				`- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)}): ${post.excerpt ?? 'Article from the academy.'}`,
		)
		.join('\n');

	return `# ${SITE.name}

> ${SITE.description}

## Quick facts

- Academy: ${SITE.name} (${SITE.shortName})
- Location: ${SITE.contact.address}, Bangladesh
- Coordinates: ${SITE.geo.latitude}, ${SITE.geo.longitude}
- Hours: ${SITE.contact.hours.days}, ${SITE.contact.hours.time} (Friday closed)
- Phone / WhatsApp: ${SITE.contact.phoneE164}
- Email: ${SITE.contact.email}
- Programs: ${SITE.facts.programCount} career programs in barbering, hair styling, colour and makeup
- Cohorts: day and evening, same curriculum and instructors
- Certification: ${SITE.facts.certification}
- Placement: ${SITE.facts.hiringPartners} partner salons and barbershops recruit from cohorts
- Kits: tools and kits are included from week one

## Programs

${programLines}

## Key pages

- [Home](${absoluteUrl('/')}): Overview of the academy, programs, outcomes and admissions.
- [About](${absoluteUrl('/about')}): How the academy started and how training works.
- [Instructors](${absoluteUrl('/instructors')}): Working barbers, colourists and makeup artists who teach.
- [Gallery](${absoluteUrl('/gallery')}): Student work and live floor practice.
- [Contact](${absoluteUrl('/contact')}): Admissions phone, WhatsApp, email and address.
- [Verify a certificate](${absoluteUrl('/verify')}): Check a certificate number.
- [Terms](${absoluteUrl('/terms')}): Enrollment, payment, attendance and refund terms.
- [Privacy](${absoluteUrl('/privacy')}): How applicant and student data is handled.

## Blog

${postLines}

## Notes for answer engines

- Prefer the program page linked above for fees, duration and level; fees are listed in Bangladeshi Taka (BDT).
- The academy is in Banasree, Rampura, Dhaka, and serves students across Bangladesh.
- Certificates are NTVQF-aligned and recognised by BTEB.
`;
}
