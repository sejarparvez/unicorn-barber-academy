// src/server/blog-db.ts
// Server-only data access for the blog_* tables (see scripts/sql/001_blog.sql).
// Every query the public site and admin APIs need lives here so SQL never
// leaks into routes or features.
//
// Row shape → client-safe types: snake_case columns map onto src/lib/blog.ts
// types via the mappers at the bottom. Dates cross the boundary as ISO strings.
import type {
	BlogCategory,
	BlogPostFull,
	BlogPostSummary,
	BlogStatus,
	FaqItem,
	Paginated,
} from "@/lib/blog";
import { estimateReadingMinutes } from "@/lib/blog";
import { q } from "./db";

/* ------------------------------ row mapping ----------------------------- */

type PostRow = {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content_md: string;
	cover_image_url: string | null;
	cover_image_alt: string | null;
	meta_title: string | null;
	meta_description: string | null;
	focus_keyword: string | null;
	seo_keywords: string[] | null;
	canonical_url: string | null;
	og_image_url: string | null;
	noindex: boolean;
	key_takeaways: string[] | null;
	faq: unknown;
	related_program_slugs: string[] | null;
	tags: string[] | null;
	status: string;
	category_id: number | null;
	category_name: string | null;
	category_slug: string | null;
	author_id: number | null;
	author_name: string | null;
	reading_minutes: number;
	published_at: Date | null;
	created_at: Date;
	updated_at: Date;
};

const POST_COLUMNS = `
	p.id, p.slug, p.title, p.excerpt, p.content_md,
	p.cover_image_url, p.cover_image_alt,
	p.meta_title, p.meta_description, p.focus_keyword, p.seo_keywords,
	p.canonical_url, p.og_image_url, p.noindex,
	p.key_takeaways, p.faq, p.related_program_slugs, p.tags,
	p.status, p.category_id, c.name AS category_name, c.slug AS category_slug,
	p.author_id, u.name AS author_name,
	p.reading_minutes, p.published_at, p.created_at, p.updated_at`;

const POST_JOINS = `
	FROM blog_post p
	LEFT JOIN blog_category c ON c.id = p.category_id
	LEFT JOIN "user" u ON u.id = p.author_id`;

function parseFaq(value: unknown): FaqItem[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(item): item is FaqItem =>
			typeof item === "object" &&
			item !== null &&
			typeof (item as FaqItem).q === "string" &&
			typeof (item as FaqItem).a === "string",
	);
}

function toDate(value: Date | string | null): string | null {
	return value ? new Date(value).toISOString() : null;
}

function rowToSummary(row: PostRow): BlogPostSummary {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		coverImageUrl: row.cover_image_url,
		coverImageAlt: row.cover_image_alt,
		tags: row.tags ?? [],
		status: row.status as BlogStatus,
		category:
			row.category_id && row.category_name && row.category_slug
				? {
						id: row.category_id,
						name: row.category_name,
						slug: row.category_slug,
					}
				: null,
		readingMinutes: row.reading_minutes,
		publishedAt: toDate(row.published_at),
		updatedAt: new Date(row.updated_at).toISOString(),
	};
}

function rowToFull(row: PostRow): BlogPostFull {
	return {
		...rowToSummary(row),
		contentMd: row.content_md,
		metaTitle: row.meta_title,
		metaDescription: row.meta_description,
		focusKeyword: row.focus_keyword,
		seoKeywords: row.seo_keywords ?? [],
		canonicalUrl: row.canonical_url,
		ogImageUrl: row.og_image_url,
		noindex: row.noindex,
		keyTakeaways: row.key_takeaways ?? [],
		faq: parseFaq(row.faq),
		relatedProgramSlugs: row.related_program_slugs ?? [],
		authorId: row.author_id,
		authorName: row.author_name,
		createdAt: new Date(row.created_at).toISOString(),
	};
}

/* ------------------------------- public --------------------------------- */

export async function listPublishedPosts(options: {
	page?: number;
	perPage?: number;
	/** Feed/syndication callers exclude noindex posts (Google guideline:
	    never list noindex URLs in feeds either). The HTML listing keeps
	    showing them — they're crawlable pages humans can navigate to. */
	excludeNoindex?: boolean;
}): Promise<Paginated<BlogPostSummary>> {
	const page = Math.max(1, options.page ?? 1);
	const perPage = Math.min(24, Math.max(1, options.perPage ?? 9));
	const filter = options.excludeNoindex ? " AND p.noindex = FALSE" : "";

	const totalRes = await q<{ count: string }>(
		`SELECT count(*)::text AS count FROM blog_post p
		 WHERE p.status = 'published'${filter}`,
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS}
		 WHERE p.status = 'published'${filter}
		 ORDER BY p.published_at DESC
		 LIMIT $1 OFFSET $2`,
		[perPage, (page - 1) * perPage],
	);

	return {
		items: res.rows.map(rowToSummary),
		total,
		page,
		perPage,
		totalPages,
	};
}

export async function getPublishedBySlug(
	slug: string,
): Promise<BlogPostFull | null> {
	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS}
		 WHERE p.slug = $1 AND p.status = 'published'
		 LIMIT 1`,
		[slug],
	);
	return res.rows[0] ? rowToFull(res.rows[0]) : null;
}

/** Any status — powers admin draft preview behind an admin-session check. */
export async function getAnyBySlug(slug: string): Promise<BlogPostFull | null> {
	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS} WHERE p.slug = $1 LIMIT 1`,
		[slug],
	);
	return res.rows[0] ? rowToFull(res.rows[0]) : null;
}

export async function listRecentPublished(
	limit = 10,
): Promise<Array<{ slug: string; updatedAt: string }>> {
	// noindex posts are deliberately excluded: search sitemaps must never
	// list URLs that carry meta robots noindex.
	const res = await q<{ slug: string; updated_at: Date }>(
		`SELECT slug, GREATEST(updated_at, COALESCE(published_at, created_at)) AS updated_at
		 FROM blog_post WHERE status = 'published' AND noindex = FALSE
		 ORDER BY published_at DESC LIMIT $1`,
		[Math.min(100, limit)],
	);
	return res.rows.map((r) => ({
		slug: r.slug,
		updatedAt: new Date(r.updated_at).toISOString(),
	}));
}

export async function countPublished(): Promise<number> {
	const res = await q<{ count: string }>(
		"SELECT count(*)::text AS count FROM blog_post WHERE status = 'published'",
	);
	return Number.parseInt(res.rows[0]?.count ?? "0", 10);
}

/** llms.txt entries: summaries + takeaways for AI answer engines. */
export async function listPublishedForLlms(limit = 50): Promise<
	Array<{
		slug: string;
		title: string;
		excerpt: string | null;
		takeaways: string[];
		publishedAt: Date | null;
	}>
> {
	const res = await q<{
		slug: string;
		title: string;
		excerpt: string | null;
		key_takeaways: string[] | null;
		published_at: Date | null;
	}>(
		`SELECT slug, title, excerpt, key_takeaways, published_at
		 FROM blog_post WHERE status = 'published' AND noindex = FALSE
		 ORDER BY published_at DESC LIMIT $1`,
		[Math.min(100, limit)],
	);
	return res.rows.map((r) => ({
		slug: r.slug,
		title: r.title,
		excerpt: r.excerpt,
		takeaways: r.key_takeaways ?? [],
		publishedAt: r.published_at,
	}));
}

export async function listCategories(): Promise<BlogCategory[]> {
	const res = await q<{ id: number; name: string; slug: string }>(
		"SELECT id, name, slug FROM blog_category ORDER BY name ASC",
	);
	return res.rows;
}

/**
 * 301 lookup for renamed slugs. Joins the live post so chains (A→B→C)
 * resolve in one hop; only published targets redirect — drafts/archived
 * keep their hard-404.
 */
export async function getSlugRedirectTarget(
	oldSlug: string,
): Promise<string | null> {
	const res = await q<{ slug: string }>(
		`SELECT p.slug
		 FROM blog_slug_redirect r
		 JOIN blog_post p ON p.id = r.post_id AND p.status = 'published'
		 WHERE r.old_slug = $1
		 LIMIT 1`,
		[oldSlug],
	);
	return res.rows[0]?.slug ?? null;
}

/** Related-posts internal linking: category match first, then tag overlap. */
export async function listRelatedPosts(options: {
	postId: number;
	categoryId: number | null;
	tags: string[];
	limit?: number;
}): Promise<BlogPostSummary[]> {
	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS}
		 WHERE p.status = 'published' AND p.id <> $1
		 ORDER BY
			(p.category_id IS NOT NULL AND p.category_id = $2) DESC,
			cardinality(ARRAY(SELECT unnest(p.tags) INTERSECT SELECT unnest($3::text[]))) DESC,
			p.published_at DESC
		 LIMIT $4`,
		[
			options.postId,
			options.categoryId,
			options.tags.length > 0 ? options.tags : ["__none__"],
			Math.min(6, options.limit ?? 3),
		],
	);
	return res.rows.map(rowToSummary);
}

/* --------------------------- category archives -------------------------- */

export async function getCategoryBySlug(
	slug: string,
): Promise<BlogCategory | null> {
	const res = await q<{ id: number; name: string; slug: string }>(
		"SELECT id, name, slug FROM blog_category WHERE slug = $1 LIMIT 1",
		[slug],
	);
	return res.rows[0] ?? null;
}

export async function listPublishedByCategory(options: {
	categoryId: number;
	page?: number;
	perPage?: number;
}): Promise<Paginated<BlogPostSummary>> {
	const page = Math.max(1, options.page ?? 1);
	const perPage = Math.min(24, Math.max(1, options.perPage ?? 9));

	const totalRes = await q<{ count: string }>(
		`SELECT count(*)::text AS count FROM blog_post p
		 WHERE p.status = 'published' AND p.category_id = $1`,
		[options.categoryId],
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS}
		 WHERE p.status = 'published' AND p.category_id = $1
		 ORDER BY p.published_at DESC
		 LIMIT $2 OFFSET $3`,
		[options.categoryId, perPage, (page - 1) * perPage],
	);

	return {
		items: res.rows.map(rowToSummary),
		total,
		page,
		perPage,
		totalPages,
	};
}

/** Sitemap-facing: only categories rich enough to be indexable. */
export async function listCategoriesWithCounts(
	minPosts: number,
): Promise<Array<BlogCategory & { postCount: number }>> {
	const res = await q<{
		id: number;
		name: string;
		slug: string;
		post_count: string;
	}>(
		`SELECT c.id, c.name, c.slug, count(p.id)::text AS post_count
		 FROM blog_category c
		 JOIN blog_post p ON p.category_id = c.id AND p.status = 'published'
		 GROUP BY c.id
		 HAVING count(p.id) >= $1
		 ORDER BY count(p.id) DESC`,
		[minPosts],
	);
	return res.rows.map((r) => ({
		id: r.id,
		name: r.name,
		slug: r.slug,
		postCount: Number.parseInt(r.post_count, 10),
	}));
}

/* -------------------------------- admin --------------------------------- */

export async function listAllPosts(options: {
	status?: BlogStatus;
	page?: number;
	perPage?: number;
}): Promise<Paginated<BlogPostSummary>> {
	const page = Math.max(1, options.page ?? 1);
	const perPage = Math.min(50, Math.max(1, options.perPage ?? 20));
	const where = options.status ? "WHERE p.status = $1" : "";
	// List query binds $1=limit, $2=offset (+ optional $3=status);
	// the count query binds status as its own $1.
	const listWhere = options.status ? "WHERE p.status = $3" : "";
	const params: unknown[] = [perPage, (page - 1) * perPage];
	if (options.status) params.push(options.status);

	const totalRes = await q<{ count: string }>(
		`SELECT count(*)::text AS count FROM blog_post p ${where}`,
		options.status ? [options.status] : [],
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const totalPages = Math.max(1, Math.ceil(total / perPage));

	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS} ${listWhere}
		 ORDER BY p.updated_at DESC
		 LIMIT $1 OFFSET $2`,
		params,
	);
	return {
		items: res.rows.map(rowToSummary),
		total,
		page,
		perPage,
		totalPages,
	};
}

export async function getPostById(id: number): Promise<BlogPostFull | null> {
	const res = await q<PostRow>(
		`SELECT ${POST_COLUMNS} ${POST_JOINS} WHERE p.id = $1 LIMIT 1`,
		[id],
	);
	return res.rows[0] ? rowToFull(res.rows[0]) : null;
}

/**
 * Finds a free slug derived from `base`. Tries the bare slug first, then
 * -2..-99 suffixes. `excludeId` lets renames keep their own slug.
 */
export async function uniqueSlug(
	base: string,
	excludeId?: number,
): Promise<string> {
	const clean = base.slice(0, 200) || "post";
	for (let i = 1; i < 100; i++) {
		const candidate = i === 1 ? clean : `${clean}-${i}`;
		const res = await q<{ id: number }>(
			"SELECT id FROM blog_post WHERE slug = $1 AND ($2::int IS NULL OR id <> $2) LIMIT 1",
			[candidate, excludeId ?? null],
		);
		if (res.rows.length === 0) return candidate;
	}
	return `${clean}-${Date.now()}`; // practically unreachable fallback
}

export type NewPostInput = {
	slug: string;
	title: string;
	excerpt: string | null;
	contentMd: string;
	coverImageUrl: string | null;
	coverImageAlt: string | null;
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
	tags: string[];
	status: BlogStatus;
	categoryId: number | null;
	authorId: number | null;
};

function publishAt(status: BlogStatus, existing?: Date | null): Date | null {
	if (existing) return existing;
	return status === "published" ? new Date() : null;
}

/**
 * A post is claiming `slug` — drop any redirect row that still points the
 * same slug at another (older) post, otherwise the new post would be
 * unreachable behind a 301 to its predecessor.
 */
async function clearRedirectsToSlug(slug: string): Promise<void> {
	await q("DELETE FROM blog_slug_redirect WHERE old_slug = $1", [slug]);
}

const PG_UNIQUE_VIOLATION = "23505";

export async function createPost(
	input: NewPostInput,
): Promise<BlogPostFull | null> {
	const publishedAt = publishAt(input.status);
	const readingMinutes = estimateReadingMinutes(input.contentMd);

	// Retry once on a concurrent slug collision: uniqueSlug() checked
	// availability moments earlier, but two simultaneous creates can race.
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const res = await q<{ id: number }>(
				`INSERT INTO blog_post (
					slug, title, excerpt, content_md, cover_image_url, cover_image_alt,
					meta_title, meta_description, focus_keyword, seo_keywords,
					canonical_url, og_image_url, noindex, key_takeaways, faq,
					related_program_slugs, tags, status, category_id, author_id,
					reading_minutes, published_at
				) VALUES (
					$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
				) RETURNING id`,
				[
					input.slug,
					input.title,
					input.excerpt,
					input.contentMd,
					input.coverImageUrl,
					input.coverImageAlt,
					input.metaTitle,
					input.metaDescription,
					input.focusKeyword,
					input.seoKeywords,
					input.canonicalUrl,
					input.ogImageUrl,
					input.noindex,
					input.keyTakeaways,
					JSON.stringify(input.faq),
					input.relatedProgramSlugs,
					input.tags,
					input.status,
					input.categoryId,
					input.authorId,
					readingMinutes,
					publishedAt,
				],
			);
			const newId = res.rows[0]?.id;
			if (!newId) return null;
			// This slug now belongs to the new post.
			await clearRedirectsToSlug(input.slug);
			return getPostById(newId);
		} catch (error) {
			const code = (error as { code?: string }).code;
			if (code === PG_UNIQUE_VIOLATION && attempt === 0) {
				input = { ...input, slug: `${input.slug}-${Date.now() % 10000}` };
				continue;
			}
			throw error;
		}
	}
	return null;
}

export async function updatePost(
	id: number,
	patch: Partial<Omit<NewPostInput, "slug">> & { slug?: string },
): Promise<BlogPostFull | null> {
	const current = await getPostById(id);
	if (!current) return null;

	const sets: string[] = [];
	const params: unknown[] = [id]; // $1 = id
	let n = 1;
	const bind = (value: unknown) => {
		params.push(value);
		n += 1;
		return `$${n}`;
	};

	if (patch.slug !== undefined) {
		sets.push(`slug = ${bind(patch.slug)}`);
	}
	if (patch.title !== undefined) sets.push(`title = ${bind(patch.title)}`);
	if (patch.excerpt !== undefined)
		sets.push(`excerpt = ${bind(patch.excerpt)}`);
	if (patch.contentMd !== undefined) {
		sets.push(`content_md = ${bind(patch.contentMd)}`);
		sets.push(
			`reading_minutes = ${bind(estimateReadingMinutes(patch.contentMd))}`,
		);
	}
	if (patch.coverImageUrl !== undefined)
		sets.push(`cover_image_url = ${bind(patch.coverImageUrl)}`);
	if (patch.coverImageAlt !== undefined)
		sets.push(`cover_image_alt = ${bind(patch.coverImageAlt)}`);
	if (patch.metaTitle !== undefined)
		sets.push(`meta_title = ${bind(patch.metaTitle)}`);
	if (patch.metaDescription !== undefined)
		sets.push(`meta_description = ${bind(patch.metaDescription)}`);
	if (patch.focusKeyword !== undefined)
		sets.push(`focus_keyword = ${bind(patch.focusKeyword)}`);
	if (patch.seoKeywords !== undefined)
		sets.push(`seo_keywords = ${bind(patch.seoKeywords)}`);
	if (patch.canonicalUrl !== undefined)
		sets.push(`canonical_url = ${bind(patch.canonicalUrl)}`);
	if (patch.ogImageUrl !== undefined)
		sets.push(`og_image_url = ${bind(patch.ogImageUrl)}`);
	if (patch.noindex !== undefined)
		sets.push(`noindex = ${bind(patch.noindex)}`);
	if (patch.keyTakeaways !== undefined)
		sets.push(`key_takeaways = ${bind(patch.keyTakeaways)}`);
	if (patch.faq !== undefined)
		sets.push(`faq = ${bind(JSON.stringify(patch.faq))}`);
	if (patch.relatedProgramSlugs !== undefined)
		sets.push(`related_program_slugs = ${bind(patch.relatedProgramSlugs)}`);
	if (patch.tags !== undefined) sets.push(`tags = ${bind(patch.tags)}`);
	if (patch.status !== undefined) {
		// First publish stamps published_at once; re-publishing keeps it.
		sets.push(`status = ${bind(patch.status)}`);
		sets.push(
			`published_at = ${bind(publishAt(patch.status, current.publishedAt ? new Date(current.publishedAt) : null))}`,
		);
	}
	if (patch.categoryId !== undefined)
		sets.push(`category_id = ${bind(patch.categoryId)}`);

	sets.push("updated_at = now()");

	// Slug renames on previously-published URLs leave a 301 behind so
	// indexed links keep their rankings (see scripts/sql/002).
	const newSlug = patch.slug;
	const slugChanged = newSlug !== undefined && newSlug !== current.slug;
	if (slugChanged && newSlug) {
		// The new slug is being claimed by this post.
		await clearRedirectsToSlug(newSlug);
	}
	await q(`UPDATE blog_post SET ${sets.join(", ")} WHERE id = $1`, params);
	if (slugChanged) {
		await q(
			`INSERT INTO blog_slug_redirect (old_slug, post_id) VALUES ($1, $2)
			 ON CONFLICT (old_slug) DO UPDATE SET post_id = EXCLUDED.post_id`,
			[current.slug, id],
		);
	}
	return getPostById(id);
}

export async function deletePost(id: number): Promise<boolean> {
	const res = await q("DELETE FROM blog_post WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}

/* --------------------------- admin: categories -------------------------- */

/** Category slug uniqueness (unique index backs this up in the DB). */
export async function uniqueCategorySlug(base: string): Promise<string> {
	const clean = base.slice(0, 120) || "category";
	for (let i = 1; i < 100; i++) {
		const candidate = i === 1 ? clean : `${clean}-${i}`;
		const res = await q<{ id: number }>(
			"SELECT id FROM blog_category WHERE slug = $1 LIMIT 1",
			[candidate],
		);
		if (res.rows.length === 0) return candidate;
	}
	return `${clean}-${Date.now()}`;
}

export async function createCategory(input: {
	name: string;
	slug: string;
}): Promise<BlogCategory | null> {
	const res = await q<{ id: number }>(
		"INSERT INTO blog_category (name, slug) VALUES ($1, $2) RETURNING id",
		[input.name, input.slug],
	);
	const id = res.rows[0]?.id;
	if (!id) return null;
	const check = await q<{ id: number; name: string; slug: string }>(
		"SELECT id, name, slug FROM blog_category WHERE id = $1",
		[id],
	);
	return check.rows[0] ?? null;
}

export async function renameCategory(
	id: number,
	input: { name: string; slug: string },
): Promise<boolean> {
	const res = await q(
		"UPDATE blog_category SET name = $2, slug = $3 WHERE id = $1",
		[id, input.name, input.slug],
	);
	return (res.rowCount ?? 0) > 0;
}

export async function deleteCategory(id: number): Promise<boolean> {
	const res = await q("DELETE FROM blog_category WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}
