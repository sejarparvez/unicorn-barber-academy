// src/server/blog-validate.ts
// Manual payload validation for the blog admin APIs — same house style as
// api/contact.tsx (no schema library). Returns normalized values so the DB
// layer receives clean data regardless of what the client sent.
import { ALL_PROGRAMS } from "@/data/programs";
import {
	type BlogStatus,
	type FaqItem,
	parseBlogStatus,
	slugify,
} from "@/lib/blog";

const HTTP_URL = /^https?:\/\/\S+$/i;

export type ValidationResult<T> =
	| { ok: true; value: T }
	| { ok: false; message: string };

function str(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function nullableStr(value: unknown, max: number): string | null {
	const s = str(value);
	if (!s) return null;
	return s.length > max ? s.slice(0, max) : s;
}

function urlOrNull(value: unknown): string | null | false {
	const s = str(value);
	if (!s) return null;
	return HTTP_URL.test(s) ? s : false;
}

/** Trims, drops empties, dedupes, caps length and count. */
function cleanList(value: unknown, maxItems: number, maxLen: number): string[] {
	if (!Array.isArray(value)) return [];
	const out: string[] = [];
	for (const raw of value) {
		const item = str(raw).slice(0, maxLen);
		if (item && !out.includes(item)) out.push(item);
		if (out.length >= maxItems) break;
	}
	return out;
}

function cleanFaq(value: unknown): FaqItem[] | false {
	if (!Array.isArray(value)) return [];
	const out: FaqItem[] = [];
	for (const raw of value.slice(0, 20)) {
		if (typeof raw !== "object" || raw === null) continue;
		const q = str((raw as FaqItem).q);
		const a = str((raw as FaqItem).a);
		if (!q || !a) continue;
		out.push({ q: q.slice(0, 300), a: a.slice(0, 2000) });
	}
	return out;
}

export type PostPayload = {
	slug: string | null;
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
};

export function parsePostPayload(body: unknown): ValidationResult<PostPayload> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;

	const title = str(b.title);
	if (!title) return { ok: false, message: "Title is required" };
	if (title.length > 200) {
		return { ok: false, message: "Title must be 200 characters or fewer" };
	}

	let slug: string | null = slugify(str(b.slug) || title);
	if (!slug) slug = "post";

	const contentMd = typeof b.contentMd === "string" ? b.contentMd : "";
	if (contentMd.length > 400_000) {
		return { ok: false, message: "Content is too large" };
	}

	const status = parseBlogStatus(b.status) ?? "draft";

	const coverUrl = urlOrNull(b.coverImageUrl);
	if (coverUrl === false) {
		return { ok: false, message: "Cover image URL must start with http(s)" };
	}
	// Alt text is the image-keyword mechanism AND an accessibility
	// requirement — a cover without one never ships.
	if (coverUrl && !str(b.coverImageAlt)) {
		return {
			ok: false,
			message:
				"Cover image alt text is required — describe the image using natural keywords.",
		};
	}
	const canonical = urlOrNull(b.canonicalUrl);
	if (canonical === false) {
		return { ok: false, message: "Canonical URL must be a valid http(s) URL" };
	}
	const ogImage = urlOrNull(b.ogImageUrl);
	if (ogImage === false) {
		return { ok: false, message: "OG image URL must be a valid http(s) URL" };
	}

	const faq = cleanFaq(b.faq);
	if (faq === false) {
		return {
			ok: false,
			message: "FAQ items must have a question and an answer",
		};
	}

	// Only slugs that actually exist in the program catalog pass through.
	const validProgramSlugs = new Set(ALL_PROGRAMS.map((p) => p.slug));
	const relatedProgramSlugs = cleanList(b.relatedProgramSlugs, 6, 120).filter(
		(slug) => validProgramSlugs.has(slug),
	);

	const categoryRaw = b.categoryId;
	const categoryId =
		categoryRaw === null || categoryRaw === undefined || categoryRaw === ""
			? null
			: Number.parseInt(String(categoryRaw), 10);
	if (
		categoryId !== null &&
		(!Number.isInteger(categoryId) || categoryId < 1)
	) {
		return { ok: false, message: "Invalid category" };
	}

	return {
		ok: true,
		value: {
			slug,
			title,
			excerpt: nullableStr(b.excerpt, 400),
			contentMd,
			coverImageUrl: coverUrl,
			coverImageAlt: nullableStr(b.coverImageAlt, 300),
			metaTitle: nullableStr(b.metaTitle, 200),
			metaDescription: nullableStr(b.metaDescription, 400),
			focusKeyword: nullableStr(b.focusKeyword, 120),
			seoKeywords: cleanList(b.seoKeywords, 15, 120),
			canonicalUrl: canonical,
			ogImageUrl: ogImage,
			noindex: b.noindex === true,
			keyTakeaways: cleanList(b.keyTakeaways, 8, 300),
			faq,
			relatedProgramSlugs,
			tags: cleanList(b.tags, 12, 40),
			status,
			categoryId,
		},
	};
}

export function parseCategoryPayload(body: unknown): ValidationResult<{
	name: string;
	slug: string;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const name = str((body as Record<string, unknown>).name);
	if (!name || name.length > 80) {
		return { ok: false, message: "Category name is required (max 80 chars)" };
	}
	const slug = slugify(str((body as Record<string, unknown>).slug) || name);
	if (!slug) return { ok: false, message: "Could not derive a slug" };
	return { ok: true, value: { name, slug } };
}
