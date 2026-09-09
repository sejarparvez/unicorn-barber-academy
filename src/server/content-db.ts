// src/server/content-db.ts
// Server-only data access for content collections (instructors, gallery,
// testimonials). Reads resolve image_url over the legacy pic() seed bridge
// (see prisma/schema.prisma) so existing bundled photos keep rendering until
// admin re-uploads; the client never needs to know which source won.

import { pic } from "@/data/images";
import { ALL_PROGRAMS, getProgramBySlug } from "@/data/programs";
import type {
	FaqAdmin,
	FaqPlacement,
	FaqView,
	GalleryAdmin,
	GalleryCategory,
	GalleryView,
	InstructorAdmin,
	InstructorView,
	TestimonialAdmin,
	TestimonialView,
} from "@/lib/content";
import { parseFaqPlacement, parseGalleryCategory } from "@/lib/content";
import { db } from "./db";
import { PG_UNIQUE_VIOLATION } from "./pg-codes";

export type ContentMutationResult =
	| { ok: true; id?: number }
	| { ok: false; reason: "not-found" | "slug-taken" | "member-taken" };

function instructorImage(
	imageUrl: string | null,
	imageSeed: string | null,
): string {
	if (imageUrl) return imageUrl;
	if (imageSeed) {
		try {
			return pic(imageSeed, 700, 900);
		} catch {
			// Fall through to the shared placeholder below.
		}
	}
	// Guaranteed to exist (images.ts throws at boot if missing).
	return pic("_placeholder", 700, 900);
}

function teachesFor(programSlug: string | null): {
	program: string;
	to: string;
} {
	if (programSlug) {
		const program = getProgramBySlug(programSlug);
		if (program)
			return { program: program.title, to: `/programs/${program.slug}` };
		const known = ALL_PROGRAMS.find((p) => p.slug === programSlug);
		if (known) return { program: known.title, to: known.to };
	}
	return { program: "", to: "/programs" };
}

/* ------------------------------ instructors ----------------------------- */

type InstructorRow = {
	id: number;
	slug: string;
	name: string;
	title: string;
	track: string;
	member_no: string;
	years: number;
	bio: string | null;
	specialties: string[] | null;
	image_url: string | null;
	image_alt: string | null;
	image_seed: string | null;
	instagram: string | null;
	program_slug: string | null;
	lead: boolean;
	quote: string | null;
	sort_order: number;
	is_published: boolean;
};

function toInstructorView(row: InstructorRow): InstructorView {
	return {
		slug: row.slug,
		name: row.name,
		title: row.title,
		track: row.track === "beauty" ? "beauty" : "barbering",
		memberNo: row.member_no,
		years: row.years,
		bio: row.bio ?? "",
		specialties: row.specialties ?? [],
		image: instructorImage(row.image_url, row.image_seed),
		imageAlt:
			row.image_alt ?? (row.image_seed ? `${row.name}, ${row.title}` : ""),
		instagram: row.instagram,
		teaches: teachesFor(row.program_slug),
		lead: row.lead,
		quote: row.quote,
	};
}

/** Published instructors for public pages, leads first then sort order. */
export async function listInstructorsPublic(): Promise<InstructorView[]> {
	const res = await db().query<InstructorRow>(
		`SELECT * FROM instructor WHERE is_published = TRUE
		 ORDER BY "lead" DESC, sort_order ASC, name ASC`,
	);
	return res.rows.map(toInstructorView);
}

export async function listInstructorsAdmin(): Promise<InstructorAdmin[]> {
	const res = await db().query<InstructorRow>(
		`SELECT * FROM instructor ORDER BY sort_order ASC, name ASC`,
	);
	return res.rows.map((row) => ({
		...toInstructorView(row),
		id: row.id,
		isPublished: row.is_published,
		sortOrder: row.sort_order,
		programSlug: row.program_slug,
	}));
}

export type InstructorInput = {
	slug: string;
	name: string;
	title: string;
	track: string;
	memberNo: string;
	years: number;
	bio: string;
	specialties: string[];
	imageUrl: string | null;
	imageAlt: string | null;
	instagram: string | null;
	programSlug: string | null;
	lead: boolean;
	quote: string | null;
	sortOrder: number;
	isPublished: boolean;
};

export async function createInstructor(
	input: InstructorInput,
): Promise<ContentMutationResult> {
	try {
		const res = await db().query<{ id: number }>(
			`INSERT INTO instructor
				(slug, name, title, track, member_no, years, bio, specialties,
				 image_url, image_alt, instagram, program_slug, "lead", quote,
				 sort_order, is_published, updated_at)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())
			 RETURNING id`,
			[
				input.slug,
				input.name,
				input.title,
				input.track,
				input.memberNo,
				input.years,
				input.bio,
				input.specialties,
				input.imageUrl,
				input.imageAlt,
				input.instagram,
				input.programSlug,
				input.lead,
				input.quote,
				input.sortOrder,
				input.isPublished,
			],
		);
		return { ok: true, id: res.rows[0]?.id };
	} catch (error) {
		if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
			return { ok: false, reason: "slug-taken" };
		}
		throw error;
	}
}

export async function updateInstructor(
	id: number,
	patch: Partial<InstructorInput>,
): Promise<ContentMutationResult> {
	const column: Record<string, string> = {
		slug: "slug",
		name: "name",
		title: "title",
		track: "track",
		memberNo: "member_no",
		years: "years",
		bio: "bio",
		specialties: "specialties",
		imageUrl: "image_url",
		imageAlt: "image_alt",
		instagram: "instagram",
		programSlug: "program_slug",
		lead: '"lead"',
		quote: "quote",
		sortOrder: "sort_order",
		isPublished: "is_published",
	};
	const sets: string[] = [];
	const params: unknown[] = [];
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined || !column[key]) continue;
		params.push(value);
		sets.push(`${column[key]} = $${params.length + 1}`);
	}
	if (sets.length === 0) {
		const exists = await db().query("SELECT 1 FROM instructor WHERE id = $1", [
			id,
		]);
		return exists.rows.length > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	}
	try {
		params.unshift(id);
		const res = await db().query(
			`UPDATE instructor SET ${sets.join(", ")}, updated_at = now() WHERE id = $1`,
			params,
		);
		return (res.rowCount ?? 0) > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	} catch (error) {
		if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
			const msg = (error as { detail?: string }).detail ?? "";
			return {
				ok: false,
				reason: msg.includes("member") ? "member-taken" : "slug-taken",
			};
		}
		throw error;
	}
}

export async function deleteInstructor(id: number): Promise<boolean> {
	const res = await db().query("DELETE FROM instructor WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}

/* -------------------------------- gallery ------------------------------- */

type GalleryRow = {
	id: number;
	category: string;
	image_url: string | null;
	image_alt: string | null;
	image_seed: string | null;
	caption: string | null;
	sort_order: number;
	is_published: boolean;
	is_featured: boolean;
};

function galleryImage(row: GalleryRow): string {
	if (row.image_url) return row.image_url;
	if (row.image_seed) {
		try {
			return pic(row.image_seed, 700, 800);
		} catch {
			// Fall through to the shared placeholder below.
		}
	}
	return pic("_placeholder", 700, 800);
}

export async function listGalleryPublic(
	category?: GalleryCategory,
): Promise<GalleryView[]> {
	const res = await db().query<GalleryRow>(
		`SELECT * FROM gallery_item WHERE is_published = TRUE
		 ${category ? "AND category = $1" : ""}
		 ORDER BY sort_order ASC, id ASC`,
		category ? [category] : [],
	);
	return res.rows.map((row) => {
		const image = galleryImage(row);
		return {
			id: row.id,
			image,
			alt: row.image_alt || row.caption || "Academy gallery photo",
			category: parseGalleryCategory(row.category) ?? "studio",
			w: 700,
			h: 800,
		};
	});
}

export async function listGalleryAdmin(): Promise<GalleryAdmin[]> {
	const res = await db().query<GalleryRow>(
		`SELECT * FROM gallery_item ORDER BY sort_order ASC, id ASC`,
	);
	return res.rows.map((row) => ({
		id: row.id,
		image: galleryImage(row),
		alt: row.image_alt || "",
		category: parseGalleryCategory(row.category) ?? "studio",
		caption: row.caption,
		sortOrder: row.sort_order,
		isPublished: row.is_published,
		isFeatured: row.is_featured,
	}));
}

export async function createGalleryItem(input: {
	category: GalleryCategory;
	imageUrl: string | null;
	imageAlt: string;
	caption: string | null;
	sortOrder: number;
}): Promise<ContentMutationResult> {
	const res = await db().query<{ id: number }>(
		`INSERT INTO gallery_item
			(category, image_url, image_alt, caption, sort_order, is_published)
		 VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING id`,
		[
			input.category,
			input.imageUrl,
			input.imageAlt,
			input.caption,
			input.sortOrder,
		],
	);
	return { ok: true, id: res.rows[0]?.id };
}

export async function updateGalleryItem(
	id: number,
	patch: {
		category?: GalleryCategory;
		imageUrl?: string | null;
		imageAlt?: string;
		caption?: string | null;
		sortOrder?: number;
		isPublished?: boolean;
		isFeatured?: boolean;
	},
): Promise<ContentMutationResult> {
	const column: Record<string, string> = {
		category: "category",
		imageUrl: "image_url",
		imageAlt: "image_alt",
		caption: "caption",
		sortOrder: "sort_order",
		isPublished: "is_published",
		isFeatured: "is_featured",
	};
	const sets: string[] = [];
	const params: unknown[] = [];
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined || !column[key]) continue;
		params.push(value);
		sets.push(`${column[key]} = $${params.length + 1}`);
	}
	if (sets.length === 0) {
		const exists = await db().query(
			"SELECT 1 FROM gallery_item WHERE id = $1",
			[id],
		);
		return exists.rows.length > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	}
	params.unshift(id);
	const res = await db().query(
		`UPDATE gallery_item SET ${sets.join(", ")} WHERE id = $1`,
		params,
	);
	return (res.rowCount ?? 0) > 0
		? { ok: true }
		: { ok: false, reason: "not-found" };
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
	const res = await db().query("DELETE FROM gallery_item WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}

/**
 * Home "Inside the Academy" strip: featured published photos first; when
 * nothing is featured yet, the first published photos stand in.
 */
export async function listFeaturedGallery(limit = 6): Promise<GalleryView[]> {
	const featured = await db().query<GalleryRow>(
		`SELECT * FROM gallery_item
		 WHERE is_published = TRUE AND is_featured = TRUE
		 ORDER BY sort_order ASC, id ASC LIMIT $1`,
		[limit],
	);
	const rows =
		featured.rows.length > 0
			? featured.rows
			: (
					await db().query<GalleryRow>(
						`SELECT * FROM gallery_item WHERE is_published = TRUE
						 ORDER BY sort_order ASC, id ASC LIMIT $1`,
						[limit],
					)
				).rows;
	return rows.map((row) => ({
		id: row.id,
		image: galleryImage(row),
		alt: row.image_alt || row.caption || "Academy gallery photo",
		category: parseGalleryCategory(row.category) ?? "studio",
		w: 700,
		h: 700,
	}));
}

/* ------------------------------ testimonials ---------------------------- */

type TestimonialRow = {
	id: number;
	quote: string;
	name: string;
	program_slug: string | null;
	program_name: string;
	cohort: string;
	image_url: string | null;
	image_alt: string | null;
	image_seed: string | null;
	rating: number;
	sort_order: number;
	is_published: boolean;
};

function testimonialImage(row: TestimonialRow): string | null {
	if (row.image_url) return row.image_url;
	if (row.image_seed) {
		try {
			return pic(row.image_seed, 200, 200);
		} catch {
			return null;
		}
	}
	return null;
}

export async function listTestimonialsPublic(): Promise<TestimonialView[]> {
	const res = await db().query<TestimonialRow>(
		`SELECT * FROM testimonial WHERE is_published = TRUE
		 ORDER BY sort_order ASC, id ASC`,
	);
	return res.rows.map((row) => ({
		id: row.id,
		quote: row.quote,
		name: row.name,
		program: row.program_name,
		cohort: row.cohort,
		image: testimonialImage(row),
		rating: row.rating,
	}));
}

export async function listTestimonialsAdmin(): Promise<TestimonialAdmin[]> {
	const res = await db().query<TestimonialRow>(
		`SELECT * FROM testimonial ORDER BY sort_order ASC, id ASC`,
	);
	return res.rows.map((row) => ({
		id: row.id,
		quote: row.quote,
		name: row.name,
		programSlug: row.program_slug,
		programName: row.program_name,
		cohort: row.cohort,
		image: testimonialImage(row),
		rating: row.rating,
		sortOrder: row.sort_order,
		isPublished: row.is_published,
	}));
}

export async function createTestimonial(input: {
	quote: string;
	name: string;
	programSlug: string | null;
	programName: string;
	cohort: string;
	imageUrl: string | null;
	imageAlt: string | null;
	rating: number;
	sortOrder: number;
}): Promise<ContentMutationResult> {
	const res = await db().query<{ id: number }>(
		`INSERT INTO testimonial
			(quote, name, program_slug, program_name, cohort, image_url, image_alt,
			 rating, sort_order, is_published)
		 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE) RETURNING id`,
		[
			input.quote,
			input.name,
			input.programSlug,
			input.programName,
			input.cohort,
			input.imageUrl,
			input.imageAlt,
			input.rating,
			input.sortOrder,
		],
	);
	return { ok: true, id: res.rows[0]?.id };
}

export async function updateTestimonial(
	id: number,
	patch: {
		quote?: string;
		name?: string;
		programSlug?: string | null;
		programName?: string;
		cohort?: string;
		imageUrl?: string | null;
		imageAlt?: string | null;
		rating?: number;
		sortOrder?: number;
		isPublished?: boolean;
	},
): Promise<ContentMutationResult> {
	const column: Record<string, string> = {
		quote: "quote",
		name: "name",
		programSlug: "program_slug",
		programName: "program_name",
		cohort: "cohort",
		imageUrl: "image_url",
		imageAlt: "image_alt",
		rating: "rating",
		sortOrder: "sort_order",
		isPublished: "is_published",
	};
	const sets: string[] = [];
	const params: unknown[] = [];
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined || !column[key]) continue;
		params.push(value);
		sets.push(`${column[key]} = $${params.length + 1}`);
	}
	if (sets.length === 0) {
		const exists = await db().query("SELECT 1 FROM testimonial WHERE id = $1", [
			id,
		]);
		return exists.rows.length > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	}
	params.unshift(id);
	const res = await db().query(
		`UPDATE testimonial SET ${sets.join(", ")} WHERE id = $1`,
		params,
	);
	return (res.rowCount ?? 0) > 0
		? { ok: true }
		: { ok: false, reason: "not-found" };
}

export async function deleteTestimonial(id: number): Promise<boolean> {
	const res = await db().query("DELETE FROM testimonial WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}

/* --------------------------------- faqs --------------------------------- */

export async function listFaqsPublic(
	placement: FaqPlacement,
): Promise<FaqView[]> {
	const res = await db().query<{ question: string; answer: string }>(
		`SELECT question, answer FROM faq_item
		 WHERE placement = $1 AND is_published = TRUE
		 ORDER BY sort_order ASC, id ASC`,
		[placement],
	);
	return res.rows.map((row) => ({
		question: row.question,
		answer: row.answer,
	}));
}

export async function listFaqsAdmin(
	placement?: FaqPlacement,
): Promise<FaqAdmin[]> {
	const res = await db().query<{
		id: number;
		placement: string;
		question: string;
		answer: string;
		sort_order: number;
		is_published: boolean;
	}>(
		`SELECT id, placement, question, answer, sort_order, is_published
		 FROM faq_item ${placement ? "WHERE placement = $1" : ""}
		 ORDER BY placement ASC, sort_order ASC, id ASC`,
		placement ? [placement] : [],
	);
	return res.rows.map((row) => ({
		id: row.id,
		placement: parseFaqPlacement(row.placement) ?? "home",
		question: row.question,
		answer: row.answer,
		sortOrder: row.sort_order,
		isPublished: row.is_published,
	}));
}

export async function createFaq(input: {
	placement: FaqPlacement;
	question: string;
	answer: string;
	sortOrder: number;
}): Promise<ContentMutationResult> {
	const res = await db().query<{ id: number }>(
		`INSERT INTO faq_item (placement, question, answer, sort_order, is_published)
		 VALUES ($1,$2,$3,$4,TRUE) RETURNING id`,
		[input.placement, input.question, input.answer, input.sortOrder],
	);
	return { ok: true, id: res.rows[0]?.id };
}

export async function updateFaq(
	id: number,
	patch: {
		placement?: FaqPlacement;
		question?: string;
		answer?: string;
		sortOrder?: number;
		isPublished?: boolean;
	},
): Promise<ContentMutationResult> {
	const column: Record<string, string> = {
		placement: "placement",
		question: "question",
		answer: "answer",
		sortOrder: "sort_order",
		isPublished: "is_published",
	};
	const sets: string[] = [];
	const params: unknown[] = [];
	for (const [key, value] of Object.entries(patch)) {
		if (value === undefined || !column[key]) continue;
		params.push(value);
		sets.push(`${column[key]} = $${params.length + 1}`);
	}
	if (sets.length === 0) {
		const exists = await db().query("SELECT 1 FROM faq_item WHERE id = $1", [
			id,
		]);
		return exists.rows.length > 0
			? { ok: true }
			: { ok: false, reason: "not-found" };
	}
	params.unshift(id);
	const res = await db().query(
		`UPDATE faq_item SET ${sets.join(", ")} WHERE id = $1`,
		params,
	);
	return (res.rowCount ?? 0) > 0
		? { ok: true }
		: { ok: false, reason: "not-found" };
}

export async function deleteFaq(id: number): Promise<boolean> {
	const res = await db().query("DELETE FROM faq_item WHERE id = $1", [id]);
	return (res.rowCount ?? 0) > 0;
}
