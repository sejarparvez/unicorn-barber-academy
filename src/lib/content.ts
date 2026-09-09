// src/lib/content.ts
// Client-safe content-collection types (instructors, gallery, testimonials).
// View shapes mirror the hardcoded src/data/* shapes they replace so public
// components swap sources without JSX changes.
import type { Track } from "@/data/programs";

export type GalleryCategory = "barbering" | "beauty" | "studio" | "graduation";
export const GALLERY_CATEGORIES: GalleryCategory[] = [
	"barbering",
	"beauty",
	"studio",
	"graduation",
];

export function parseGalleryCategory(
	value: unknown,
): GalleryCategory | undefined {
	return typeof value === "string" &&
		(GALLERY_CATEGORIES as readonly string[]).includes(value)
		? (value as GalleryCategory)
		: undefined;
}

/** Public instructor view — same fields as data/instructors.ts Instructor.
    `image` is never null (Cloudinary URL → bundled seed → shared
    placeholder); `imageAlt` always has text. */
export type InstructorView = {
	slug: string;
	name: string;
	title: string;
	track: Track;
	memberNo: string;
	years: number;
	bio: string;
	specialties: string[];
	image: string;
	imageAlt: string;
	instagram: string | null;
	teaches: { program: string; to: string };
	lead: boolean;
	quote: string | null;
};

/** Public gallery view — w/h default to 700x800 for masonry layout. */
export type GalleryView = {
	id: number;
	image: string;
	alt: string;
	category: GalleryCategory;
	w: number;
	h: number;
};

/** Public testimonial view. Null image → initials avatar fallback. */
export type TestimonialView = {
	id: number;
	quote: string;
	name: string;
	program: string;
	cohort: string;
	image: string | null;
	rating: number;
};

/** Admin rows carry management fields on top of the public view. */
export type InstructorAdmin = InstructorView & {
	id: number;
	isPublished: boolean;
	sortOrder: number;
	programSlug: string | null;
};

export type GalleryAdmin = {
	id: number;
	image: string | null;
	alt: string;
	category: GalleryCategory;
	caption: string | null;
	sortOrder: number;
	isPublished: boolean;
};

export type TestimonialAdmin = {
	id: number;
	quote: string;
	name: string;
	programSlug: string | null;
	programName: string;
	cohort: string;
	image: string | null;
	rating: number;
	sortOrder: number;
	isPublished: boolean;
};
