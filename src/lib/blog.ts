// src/lib/blog.ts
// Client-safe blog domain types + pure helpers crossing the server/client
// boundary. Server modules re-use these so a stray DB value can never leak
// an untyped string into components (same contract style as lib/types.ts).

export const BLOG_STATUSES = ["draft", "published", "archived"] as const;
export type BlogStatus = (typeof BLOG_STATUSES)[number];

export function parseBlogStatus(value: unknown): BlogStatus | undefined {
	return typeof value === "string" &&
		(BLOG_STATUSES as readonly string[]).includes(value)
		? (value as BlogStatus)
		: undefined;
}

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
	draft: "Draft",
	published: "Published",
	archived: "Archived",
};

/** One Q&A pair for the AIO FAQ block (stored as JSONB). */
export type FaqItem = { q: string; a: string };

export type BlogCategory = {
	id: number;
	name: string;
	slug: string;
};

/** Card/listing projection — no markdown body shipped to the client. */
export type BlogPostSummary = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	tags: string[];
	status: BlogStatus;
	category: { id: number; name: string; slug: string } | null;
	readingMinutes: number;
	publishedAt: string | null;
	updatedAt: string;
};

/** Full post for the editor (admin) — raw markdown, all SEO/AIO fields. */
export type BlogPostFull = BlogPostSummary & {
	contentMd: string;
	metaTitle: string | null;
	metaDescription: string | null;
	focusKeyword: string | null;
	seoKeywords: string[];
	canonicalUrl: string | null;
	ogImageUrl: string | null;
	noindex: boolean;
	keyTakeaways: string[];
	faq: FaqItem[];
	relatedProgramSlugs: string[];
	authorId: number | null;
	authorName: string | null;
	createdAt: string;
};

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	perPage: number;
	totalPages: number;
};

/* ------------------------------ helpers -------------------------------- */

const MAX_META_TITLE = 60;
const MAX_META_DESCRIPTION = 160;

/** Words/200 reading-time heuristic, minimum 1 minute. */
export function estimateReadingMinutes(markdown: string): number {
	const words = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/[#*_>`~[\]()!-]/g, " ")
		.split(/\s+/)
		.filter(Boolean).length;
	return Math.max(1, Math.ceil(words / 200));
}

/** Derives an excerpt from raw markdown when the editor leaves it blank. */
export function deriveExcerpt(markdown: string): string | null {
	const text = markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[#*_>`~]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	if (!text) return null;
	return text.length <= MAX_META_DESCRIPTION
		? text
		: `${text.slice(0, MAX_META_DESCRIPTION - 1).trimEnd()}…`;
}

/** URL-safe slug from arbitrary title text (already lowercased ascii-ish). */
export function slugify(input: string): string {
	return input
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "") // combining marks
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 200);
}

export type SeoCheckLevel = "good" | "warn" | "bad";
export type SeoCheck = { label: string; level: SeoCheckLevel };

/** Editor checklist — mirrors the rules the public head() applies. */
export function seoChecks(post: {
	title: string;
	slug: string;
	excerpt: string | null;
	metaTitle: string | null;
	metaDescription: string | null;
	focusKeyword: string | null;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
	keyTakeaways: string[];
	faq: FaqItem[];
}): SeoCheck[] {
	const effectiveTitle = (post.metaTitle || post.title || "").toLowerCase();
	const kw = (post.focusKeyword ?? "").toLowerCase().trim();
	const desc = post.metaDescription ?? post.excerpt ?? "";

	const checks: SeoCheck[] = [
		{
			label:
				effectiveTitle.length > 0 && effectiveTitle.length <= MAX_META_TITLE
					? `SEO title length OK (${effectiveTitle.length}/60)`
					: `SEO title should be 1–60 chars (now ${effectiveTitle.length})`,
			level:
				effectiveTitle.length === 0 || effectiveTitle.length > MAX_META_TITLE
					? "bad"
					: "good",
		},
		{
			label: desc.length
				? `Meta description length ${desc.length}/160`
				: "Add a meta description or excerpt",
			level:
				desc.length >= 50 && desc.length <= MAX_META_DESCRIPTION
					? "good"
					: desc.length === 0
						? "bad"
						: "warn",
		},
	];

	if (kw) {
		checks.push({
			label: effectiveTitle.includes(kw)
				? "Focus keyword found in SEO title"
				: "Focus keyword missing from SEO title",
			level: effectiveTitle.includes(kw) ? "good" : "warn",
		});
		checks.push({
			label: post.slug.includes(kw.replace(/\s+/g, "-"))
				? "Focus keyword found in slug"
				: "Focus keyword missing from slug",
			level: post.slug.includes(kw.replace(/\s+/g, "-")) ? "good" : "warn",
		});
	} else {
		checks.push({ label: "Set a focus keyword", level: "warn" });
	}

	checks.push(
		post.coverImageUrl
			? post.coverImageAlt
				? { label: "Cover image has alt text", level: "good" }
				: { label: "Cover image is missing alt text", level: "bad" }
			: { label: "No cover image set", level: "warn" },
	);

	checks.push(
		post.keyTakeaways.length >= 3
			? {
					label: `${post.keyTakeaways.length} key takeaways (AIO)`,
					level: "good",
				}
			: { label: "Add 3–6 key takeaways for AI extraction", level: "warn" },
	);
	checks.push(
		post.faq.length > 0
			? { label: `${post.faq.length} FAQ pairs (AIO)`, level: "good" }
			: { label: "Consider adding FAQ Q&As for answer engines", level: "warn" },
	);

	return checks;
}
