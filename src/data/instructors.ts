// src/data/instructors.ts
// Instructor roster. `teaches.program/to` links each instructor to their
// program detail page; keep slugs in sync with data/programs.ts.

import { pic } from "@/data/images";
import { SOCIAL_URLS } from "@/lib/social";
import type { Track } from "./programs";
export type Instructor = {
	name: string;
	title: string;
	track: Track;
	memberNo: string;
	years: number;
	bio: string;
	specialties: string[];
	image: string;
	instagram: string;
	teaches: { program: string; to: string };
	lead?: boolean;
	quote?: string;
};

export const INSTRUCTORS: Instructor[] = [
	{
		name: "Rafiul Karim",
		title: "Lead Instructor, Barbering",
		track: "barbering",
		memberNo: "GM-01",
		years: 16,
		lead: true,
		bio: "Started cutting hair at his uncle's shop in Old Dhaka at fifteen. Fourteen years running his own chair before he ever taught a class.",
		specialties: ["Clipper-over-comb", "Straight razor", "Client consultation"],
		image: pic("unicorn-instructor-1", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: {
			program: "Classic Barbering",
			to: "/programs/classic-barbering",
		},
		quote:
			"I don't teach shortcuts. I teach the fundamentals so well that speed shows up on its own, in a year, not a week.",
	},
	{
		name: "Farhana Rahman",
		title: "Lead Instructor, Beauty & Cosmetology",
		track: "beauty",
		memberNo: "GM-02",
		years: 13,
		lead: true,
		bio: "Trained in Bangkok before returning to Dhaka to open a studio. Still takes bridal clients most weekends between teaching cohorts.",
		specialties: ["Skincare fundamentals", "Colour theory", "Client rapport"],
		image: pic("unicorn-instructor-2", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: {
			program: "Cosmetology Fundamentals",
			to: "/programs/cosmetology-fundamentals",
		},
		quote:
			"A great technician makes a client look good. A great artist makes them feel like themselves, just more so.",
	},
	{
		name: "Imran Hossain",
		title: "Instructor, Fades & Tapers",
		track: "barbering",
		memberNo: "GM-03",
		years: 9,
		bio: "Known around Dhaka for skin fades sharp enough to see your reflection in. Trains every cohort's blending fundamentals.",
		specialties: ["Skin fades", "Taper blending", "Texture finishing"],
		image: pic("unicorn-instructor-3", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: { program: "Fades & Tapers", to: "/programs/fades-and-tapers" },
	},
	{
		name: "Shakil Ahmed",
		title: "Instructor, Beard Sculpting",
		track: "barbering",
		memberNo: "GM-04",
		years: 8,
		bio: "Runs the academy's hot-towel service block — the single most requested add-on among graduating students' first clients.",
		specialties: [
			"Line-up precision",
			"Hot-towel service",
			"Beard shape design",
		],
		image: pic("unicorn-instructor-5", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: { program: "Beard Sculpting", to: "/programs/beard-sculpting" },
	},
	{
		name: "Nusrat Jahan",
		title: "Instructor, Makeup & Styling",
		track: "beauty",
		memberNo: "GM-05",
		years: 10,
		bio: "Editorial makeup artist for two Dhaka fashion weeks running. Pushes students to build a portfolio, not just a certificate.",
		specialties: ["Bridal looks", "Editorial styling", "Photo-ready finishing"],
		image: pic("unicorn-instructor-4", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: {
			program: "Bridal & Editorial Makeup",
			to: "/programs/bridal-and-editorial-makeup",
		},
	},
	{
		name: "Meherun Nesa",
		title: "Instructor, Hair Styling & Colouring",
		track: "beauty",
		memberNo: "GM-06",
		years: 11,
		bio: "Colour-corrects the cases other salons turn away. Teaches chemistry first, technique second — she says the order matters.",
		specialties: ["Colour theory", "Chemical treatments", "Precision cutting"],
		image: pic("unicorn-instructor-6", 700, 900),
		instagram: SOCIAL_URLS.instagram,
		teaches: {
			program: "Hair Styling & Colouring",
			to: "/programs/hair-styling-and-colouring",
		},
	},
];
