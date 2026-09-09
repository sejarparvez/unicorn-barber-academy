// src/server/content-validate.ts
// Manual payload validation for content-collection endpoints (house style).
import { parseFaqPlacement, parseGalleryCategory } from "@/lib/content";
import type { ValidationResult } from "./validate-utils";
import { str } from "./validate-utils";

export type { ValidationResult } from "./validate-utils";

const TRACKS = ["barbering", "beauty"];

function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 120);
}

function cleanList(value: unknown, maxItems: number, maxLen: number): string[] {
	if (!Array.isArray(value)) return [];
	return [
		...new Set(
			value
				.filter((v): v is string => typeof v === "string")
				.map((v) => v.trim().slice(0, maxLen))
				.filter(Boolean),
		),
	].slice(0, maxItems);
}

export function parseInstructorPayload(body: unknown): ValidationResult<{
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
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const name = str(b.name).slice(0, 160);
	if (!name) return { ok: false, message: "Name is required" };
	const title = str(b.title).slice(0, 200);
	if (!title) return { ok: false, message: "Title is required" };
	const track = str(b.track);
	if (!TRACKS.includes(track))
		return { ok: false, message: "Track must be barbering or beauty" };
	const memberNo = str(b.memberNo).slice(0, 24);
	if (!memberNo) return { ok: false, message: "Member number is required" };
	const years = Number.parseInt(String(b.years ?? "0"), 10);
	if (!Number.isInteger(years) || years < 0 || years > 80) {
		return { ok: false, message: "Years must be 0–80" };
	}
	const imageUrl = str(b.imageUrl) || null;
	if (imageUrl && !/^https:\/\//.test(imageUrl)) {
		return { ok: false, message: "Image must be an https URL" };
	}
	const programSlug = str(b.programSlug) || null;
	const instagram = str(b.instagram) || null;
	if (instagram && !/^https:\/\//.test(instagram)) {
		return { ok: false, message: "Instagram must be an https URL" };
	}
	return {
		ok: true,
		value: {
			slug: str(b.slug) ? slugify(str(b.slug)) : slugify(name),
			name,
			title,
			track,
			memberNo,
			years,
			bio: str(b.bio).slice(0, 2000),
			specialties: cleanList(b.specialties, 8, 60),
			imageUrl,
			imageAlt: str(b.imageAlt).slice(0, 300) || null,
			instagram,
			programSlug,
			lead: b.lead === true,
			quote: str(b.quote).slice(0, 500) || null,
			sortOrder: Number.isInteger(Number(b.sortOrder))
				? Number(b.sortOrder)
				: 0,
			isPublished: b.isPublished !== false,
		},
	};
}

export function parseGalleryPayload(body: unknown): ValidationResult<{
	category: "barbering" | "beauty" | "studio" | "graduation";
	imageUrl: string | null;
	imageAlt: string;
	caption: string | null;
	sortOrder: number;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const category = parseGalleryCategory(b.category);
	if (!category) return { ok: false, message: "Invalid category" };
	const imageUrl = str(b.imageUrl) || null;
	if (imageUrl && !/^https:\/\//.test(imageUrl)) {
		return { ok: false, message: "Image must be an https URL" };
	}
	const imageAlt = str(b.imageAlt).slice(0, 300);
	if (!imageAlt) return { ok: false, message: "Alt text is required" };
	return {
		ok: true,
		value: {
			category,
			imageUrl,
			imageAlt,
			caption: str(b.caption).slice(0, 300) || null,
			sortOrder: Number.isInteger(Number(b.sortOrder))
				? Number(b.sortOrder)
				: 0,
		},
	};
}

export function parseTestimonialPayload(body: unknown): ValidationResult<{
	quote: string;
	name: string;
	programSlug: string | null;
	programName: string;
	cohort: string;
	imageUrl: string | null;
	imageAlt: string | null;
	rating: number;
	sortOrder: number;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const quote = str(b.quote).slice(0, 1000);
	if (!quote) return { ok: false, message: "Quote is required" };
	const name = str(b.name).slice(0, 160);
	if (!name) return { ok: false, message: "Name is required" };
	const imageUrl = str(b.imageUrl) || null;
	if (imageUrl && !/^https:\/\//.test(imageUrl)) {
		return { ok: false, message: "Image must be an https URL" };
	}
	const rating = Number.parseInt(String(b.rating ?? "5"), 10);
	if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
		return { ok: false, message: "Rating must be 1–5" };
	}
	return {
		ok: true,
		value: {
			quote,
			name,
			programSlug: str(b.programSlug) || null,
			programName: str(b.programName).slice(0, 200),
			cohort: str(b.cohort).slice(0, 24),
			imageUrl,
			imageAlt: str(b.imageAlt).slice(0, 300) || null,
			rating,
			sortOrder: Number.isInteger(Number(b.sortOrder))
				? Number(b.sortOrder)
				: 0,
		},
	};
}

export function parseFaqPayload(body: unknown): ValidationResult<{
	placement: "home" | "contact";
	question: string;
	answer: string;
	sortOrder: number;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const placement = parseFaqPlacement(b.placement);
	if (!placement)
		return { ok: false, message: "Placement must be home or contact" };
	const question = str(b.question).slice(0, 300);
	if (!question) return { ok: false, message: "Question is required" };
	const answer = str(b.answer).slice(0, 2000);
	if (!answer) return { ok: false, message: "Answer is required" };
	return {
		ok: true,
		value: {
			placement,
			question,
			answer,
			sortOrder: Number.isInteger(Number(b.sortOrder))
				? Number(b.sortOrder)
				: 0,
		},
	};
}
