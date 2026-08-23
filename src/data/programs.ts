// src/data/programs.ts
// Program catalog: types + the barbering & beauty curricula. Static content
// today; swap the arrays for a DB/Prisma query when enrollment goes live.
import { pic } from "@/data/images";

export type Track = "barbering" | "beauty";

export type CurriculumModule = {
	title: string;
	weeks: string;
	description: string;
};

export type Program = {
	slug: string;
	title: string;
	track: Track;
	duration: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	description: string;
	highlights: string[];
	image: string;
	alt: string;
	to: string;
	tuition: string;
	prerequisites: string;
	kitIncludes: string[];
	curriculum: CurriculumModule[];
	outcomes: string[];
};

const programTo = (slug: string) => `/programs/${slug}`;

export const BARBERING_PROGRAMS: Program[] = [
	{
		slug: "classic-barbering",
		title: "Classic Barbering",
		track: "barbering",
		duration: "14 weeks",
		level: "Beginner",
		description:
			"Clipper work, straight-razor shaves, and the fundamentals every chair depends on.",
		highlights: [
			"Clipper-over-comb",
			"Straight-razor shaving",
			"Client consultation",
		],
		image: pic("unicorn-program-classic", 800, 900),
		alt: "Barbering student giving a classic clipper cut in the training studio",
		to: programTo("classic-barbering"),
		tuition: "৳45,000",
		prerequisites: "None — no experience required",
		kitIncludes: [
			"Professional clipper set",
			"Shears & thinning scissors",
			"Straight razor & strop",
			"Cape, neck strips & towels",
		],
		curriculum: [
			{
				title: "Fundamentals & Sanitation",
				weeks: "Weeks 1–2",
				description:
					"Tool care, sanitation standards, posture, and the safety basics every chair is built on.",
			},
			{
				title: "Clipper Cutting",
				weeks: "Weeks 3–6",
				description:
					"Clipper-over-comb, guard work, and the core cuts that make up most day-to-day chair time.",
			},
			{
				title: "Straight-Razor Shaving",
				weeks: "Weeks 7–10",
				description:
					"Lather technique, blade angles, and the hot-towel shave service clients pay extra for.",
			},
			{
				title: "Client Chair & Portfolio",
				weeks: "Weeks 11–14",
				description:
					"Live clients under instructor supervision, building the portfolio you graduate with.",
			},
		],
		outcomes: [
			"Ready for an entry-level chair at a barbershop or salon",
			"Portfolio of live-client work for job interviews",
			"Foundation for Fades & Tapers or Beard Sculpting next",
		],
	},
	{
		slug: "fades-and-tapers",
		title: "Fades & Tapers",
		track: "barbering",
		duration: "6 weeks",
		level: "Intermediate",
		description:
			"Skin fades, tapers, and the blending techniques that separate a good cut from a great one.",
		highlights: ["Skin & bald fades", "Taper blending", "Texture finishing"],
		image: pic("unicorn-program-fades", 800, 900),
		alt: "Close-up of a skin fade haircut being finished with clippers",
		to: programTo("fades-and-tapers"),
		tuition: "৳22,000",
		prerequisites: "Classic Barbering or equivalent clipper experience",
		kitIncludes: ["Detail trimmer", "Fade guard set", "Styling comb kit"],
		curriculum: [
			{
				title: "Fade Theory & Guard Work",
				weeks: "Weeks 1–2",
				description:
					"Reading head shape, guard sequencing, and the grade transitions a fade is built from.",
			},
			{
				title: "Skin & Bald Fades",
				weeks: "Weeks 3–4",
				description:
					"Zero-line work and razor-finished skin fades, practiced to a repeatable standard.",
			},
			{
				title: "Taper Blending & Finishing",
				weeks: "Weeks 5–6",
				description:
					"Seamless taper blending and texture finishing on live clients.",
			},
		],
		outcomes: [
			"Confident, repeatable skin fades under time pressure",
			"Ready to take fade-specific bookings independently",
		],
	},
	{
		slug: "beard-sculpting",
		title: "Beard Sculpting",
		track: "barbering",
		duration: "4 weeks",
		level: "Intermediate",
		description:
			"Line-ups, shape design, and the hot-towel service clients pay extra for.",
		highlights: [
			"Line-up precision",
			"Hot-towel service",
			"Beard shape design",
		],
		image: pic("unicorn-program-beard", 800, 900),
		alt: "Barber shaping a client's beard with a straight razor",
		to: programTo("beard-sculpting"),
		tuition: "৳18,000",
		prerequisites: "Classic Barbering or equivalent experience",
		kitIncludes: [
			"Straight razor & strop",
			"Beard trimmer",
			"Hot-towel warmer access in studio",
		],
		curriculum: [
			{
				title: "Line-Up Precision",
				weeks: "Week 1",
				description: "Sharp, symmetrical line-ups freehand and with guides.",
			},
			{
				title: "Beard Shape Design",
				weeks: "Week 2",
				description:
					"Reading face shape to design a beard silhouette that actually suits the client.",
			},
			{
				title: "Hot-Towel Service",
				weeks: "Week 3",
				description:
					"The full hot-towel shave and beard-conditioning service, start to finish.",
			},
			{
				title: "Client Practicum",
				weeks: "Week 4",
				description:
					"Full-service bookings on live clients, unsupervised pace.",
			},
		],
		outcomes: [
			"Able to sell and deliver a premium beard-service add-on",
			"Hot-towel service ready for immediate chair use",
		],
	},
];

export const BEAUTY_PROGRAMS: Program[] = [
	{
		slug: "cosmetology-fundamentals",
		title: "Cosmetology Fundamentals",
		track: "beauty",
		duration: "16 weeks",
		level: "Beginner",
		description:
			"Skincare, makeup application, and hairstyling basics — the foundation for every beauty career.",
		highlights: [
			"Skincare fundamentals",
			"Makeup application",
			"Hairstyling basics",
		],
		image: pic("unicorn-program-cosmetology", 800, 900),
		alt: "Beauty student practicing a skincare facial treatment",
		to: programTo("cosmetology-fundamentals"),
		tuition: "৳50,000",
		prerequisites: "None — no experience required",
		kitIncludes: [
			"Professional makeup kit",
			"Skincare treatment tools",
			"Basic styling tool set",
		],
		curriculum: [
			{
				title: "Skincare Fundamentals",
				weeks: "Weeks 1–4",
				description:
					"Skin typing, facial treatments, and product knowledge every beauty station needs.",
			},
			{
				title: "Makeup Application Basics",
				weeks: "Weeks 5–8",
				description:
					"Everyday and event makeup application, colour matching, and technique.",
			},
			{
				title: "Hairstyling Basics",
				weeks: "Weeks 9–12",
				description: "Blow-outs, basic updos, and foundational styling tools.",
			},
			{
				title: "Client Services Practicum",
				weeks: "Weeks 13–16",
				description:
					"Full-service client bookings across skincare, makeup, and styling.",
			},
		],
		outcomes: [
			"Ready for an entry-level station at a beauty salon",
			"Foundation for Hair Styling & Colouring or Bridal Makeup next",
		],
	},
	{
		slug: "hair-styling-and-colouring",
		title: "Hair Styling & Colouring",
		track: "beauty",
		duration: "8 weeks",
		level: "Intermediate",
		description:
			"Cuts, colour theory, and chemical treatments for a full-service styling chair.",
		highlights: ["Colour theory", "Chemical treatments", "Precision cutting"],
		image: pic("unicorn-program-hairstyling", 800, 900),
		alt: "Student applying hair colour treatment to a mannequin head",
		to: programTo("hair-styling-and-colouring"),
		tuition: "৳32,000",
		prerequisites: "Cosmetology Fundamentals or equivalent experience",
		kitIncludes: ["Colour application tools", "Precision cutting shears"],
		curriculum: [
			{
				title: "Colour Theory",
				weeks: "Weeks 1–2",
				description:
					"The colour wheel, tone correction, and formulation basics.",
			},
			{
				title: "Chemical Treatments",
				weeks: "Weeks 3–5",
				description: "Perms, relaxers, and chemical safety on live clients.",
			},
			{
				title: "Precision Cutting & Finishing",
				weeks: "Weeks 6–8",
				description: "Full-service cut-and-colour bookings, start to finish.",
			},
		],
		outcomes: [
			"Ready to run a full-service colour and cut chair",
			"Colour-correction fundamentals for advanced work later",
		],
	},
	{
		slug: "bridal-and-editorial-makeup",
		title: "Bridal & Editorial Makeup",
		track: "beauty",
		duration: "5 weeks",
		level: "Advanced",
		description:
			"Special-occasion makeup and editorial looks, built for weddings and photo shoots.",
		highlights: ["Bridal looks", "Editorial styling", "Photo-ready finishing"],
		image: pic("unicorn-program-bridal-makeup", 800, 900),
		alt: "Student applying bridal makeup to a model during a practical class",
		to: programTo("bridal-and-editorial-makeup"),
		tuition: "৳28,000",
		prerequisites: "Cosmetology Fundamentals or professional makeup experience",
		kitIncludes: [
			"Bridal & editorial makeup kit",
			"False lash & airbrush basics",
		],
		curriculum: [
			{
				title: "Bridal Look Design",
				weeks: "Weeks 1–2",
				description:
					"Long-wear bridal application built to survive a full day.",
			},
			{
				title: "Editorial Styling Techniques",
				weeks: "Week 3",
				description: "Bold, photo-driven looks for editorial and fashion work.",
			},
			{
				title: "Photo-Ready Finishing",
				weeks: "Week 4",
				description:
					"Finishing technique built specifically for camera and flash.",
			},
			{
				title: "Live Shoot Practicum",
				weeks: "Week 5",
				description: "A real styled shoot — the centrepiece of your portfolio.",
			},
		],
		outcomes: [
			"Portfolio-ready editorial shoot for booking clients",
			"Ready to take bridal bookings independently",
		],
	},
];

export const ALL_PROGRAMS: Program[] = [
	...BARBERING_PROGRAMS,
	...BEAUTY_PROGRAMS,
];

export const getProgramBySlug = (slug: string) =>
	ALL_PROGRAMS.find((p) => p.slug === slug);
