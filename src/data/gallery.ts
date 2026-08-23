// src/data/gallery.ts
// Studio gallery items and before/after transformations. Each `seed` maps
// to a replaceable file in src/assets/images/ via pic() from data/images.ts.
import { pic } from "@/data/images";
export type GalleryCategory = "barbering" | "beauty" | "studio" | "graduation";

export type GalleryItem = {
	id: string;
	seed: string;
	alt: string;
	category: GalleryCategory;
	w: number;
	h: number;
};

export const GALLERY_ITEMS: GalleryItem[] = [
	{
		id: "g1",
		seed: "unicorn-gal-barb-1",
		alt: "Barber finishing a skin fade on a client",
		category: "barbering",
		w: 700,
		h: 900,
	},
	{
		id: "g2",
		seed: "unicorn-gal-barb-2",
		alt: "Close-up of straight-razor beard line-up",
		category: "barbering",
		w: 700,
		h: 620,
	},
	{
		id: "g3",
		seed: "unicorn-gal-barb-3",
		alt: "Row of clippers and shears laid out for class",
		category: "barbering",
		w: 700,
		h: 800,
	},
	{
		id: "g4",
		seed: "unicorn-gal-barb-4",
		alt: "Student practicing clipper-over-comb technique",
		category: "barbering",
		w: 700,
		h: 950,
	},
	{
		id: "g5",
		seed: "unicorn-gal-beauty-1",
		alt: "Bridal makeup application in progress",
		category: "beauty",
		w: 700,
		h: 900,
	},
	{
		id: "g6",
		seed: "unicorn-gal-beauty-2",
		alt: "Hair colour swatches used in colour theory class",
		category: "beauty",
		w: 700,
		h: 650,
	},
	{
		id: "g7",
		seed: "unicorn-gal-beauty-3",
		alt: "Student styling hair during a practical session",
		category: "beauty",
		w: 700,
		h: 880,
	},
	{
		id: "g8",
		seed: "unicorn-gal-beauty-4",
		alt: "Professional makeup kit laid out for class",
		category: "beauty",
		w: 700,
		h: 700,
	},
	{
		id: "g9",
		seed: "unicorn-gal-studio-1",
		alt: "Row of barber chairs in the training studio",
		category: "studio",
		w: 700,
		h: 900,
	},
	{
		id: "g10",
		seed: "unicorn-gal-studio-2",
		alt: "Instructor demonstrating technique to a small group",
		category: "studio",
		w: 700,
		h: 780,
	},
	{
		id: "g11",
		seed: "unicorn-gal-studio-3",
		alt: "Wide view of the academy's main studio floor",
		category: "studio",
		w: 700,
		h: 560,
	},
	{
		id: "g12",
		seed: "unicorn-gal-studio-4",
		alt: "Styling stations set up for the evening cohort",
		category: "studio",
		w: 700,
		h: 900,
	},
	{
		id: "g13",
		seed: "unicorn-gal-grad-1",
		alt: "Graduating cohort posing together at the academy",
		category: "graduation",
		w: 700,
		h: 900,
	},
	{
		id: "g14",
		seed: "unicorn-gal-grad-2",
		alt: "Student receiving their certificate on stage",
		category: "graduation",
		w: 700,
		h: 700,
	},
	{
		id: "g15",
		seed: "unicorn-gal-grad-3",
		alt: "Close-up of a completed NTVQF certificate",
		category: "graduation",
		w: 700,
		h: 620,
	},
	{
		id: "g16",
		seed: "unicorn-gal-grad-4",
		alt: "Graduates celebrating outside the academy entrance",
		category: "graduation",
		w: 700,
		h: 900,
	},
];

export type Transformation = {
	id: string;
	title: string;
	program: string;
	to: string;
	before: string;
	after: string;
};

export const TRANSFORMATIONS: Transformation[] = [
	{
		id: "t1",
		title: "Skin Fade & Line-Up",
		program: "Fades & Tapers",
		to: "/programs/fades-and-tapers",
		before: pic("unicorn-before-fade", 800, 1000),
		after: pic("unicorn-after-fade", 800, 1000),
	},
	{
		id: "t2",
		title: "Beard Shape & Hot Towel",
		program: "Beard Sculpting",
		to: "/programs/beard-sculpting",
		before: pic("unicorn-before-beard", 800, 1000),
		after: pic("unicorn-after-beard", 800, 1000),
	},
	{
		id: "t3",
		title: "Bridal Editorial Look",
		program: "Bridal & Editorial Makeup",
		to: "/programs/bridal-and-editorial-makeup",
		before: pic("unicorn-before-bridal", 800, 1000),
		after: pic("unicorn-after-bridal", 800, 1000),
	},
];
