export const SITE_URL = "https://unicornbarberacademy.com";

export const pic = (seed: string, w: number, h: number) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`;

export type Track = "barbering" | "beauty";

export type Program = {
	title: string;
	track: Track;
	duration: string;
	level: "Beginner" | "Intermediate" | "Advanced";
	description: string;
	highlights: string[];
	image: string;
	alt: string;
	to: string;
};

export const BARBERING_PROGRAMS: Program[] = [
	{
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
		to: "/programs/classic-barbering",
	},
	{
		title: "Fades & Tapers",
		track: "barbering",
		duration: "6 weeks",
		level: "Intermediate",
		description:
			"Skin fades, tapers, and the blending techniques that separate a good cut from a great one.",
		highlights: ["Skin & bald fades", "Taper blending", "Texture finishing"],
		image: pic("unicorn-program-fades", 800, 900),
		alt: "Close-up of a skin fade haircut being finished with clippers",
		to: "/programs/fades-and-tapers",
	},
	{
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
		to: "/programs/beard-sculpting",
	},
];

export const BEAUTY_PROGRAMS: Program[] = [
	{
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
		to: "/programs/cosmetology-fundamentals",
	},
	{
		title: "Hair Styling & Colouring",
		track: "beauty",
		duration: "8 weeks",
		level: "Intermediate",
		description:
			"Cuts, colour theory, and chemical treatments for a full-service styling chair.",
		highlights: ["Colour theory", "Chemical treatments", "Precision cutting"],
		image: pic("unicorn-program-hairstyling", 800, 900),
		alt: "Student applying hair colour treatment to a mannequin head",
		to: "/programs/hair-styling-and-colouring",
	},
	{
		title: "Bridal & Editorial Makeup",
		track: "beauty",
		duration: "5 weeks",
		level: "Advanced",
		description:
			"Special-occasion makeup and editorial looks, built for weddings and photo shoots.",
		highlights: ["Bridal looks", "Editorial styling", "Photo-ready finishing"],
		image: pic("unicorn-program-bridal-makeup", 800, 900),
		alt: "Student applying bridal makeup to a model during a practical class",
		to: "/programs/bridal-and-editorial-makeup",
	},
];

export const ALL_PROGRAMS: Program[] = [
	...BARBERING_PROGRAMS,
	...BEAUTY_PROGRAMS,
];

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
		instagram: "https://instagram.com",
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
		instagram: "https://instagram.com",
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
		bio: "Known around Gulshan for skin fades sharp enough to see your reflection in. Trains every cohort's blending fundamentals.",
		specialties: ["Skin fades", "Taper blending", "Texture finishing"],
		image: pic("unicorn-instructor-3", 700, 900),
		instagram: "https://instagram.com",
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
		instagram: "https://instagram.com",
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
		instagram: "https://instagram.com",
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
		instagram: "https://instagram.com",
		teaches: {
			program: "Hair Styling & Colouring",
			to: "/programs/hair-styling-and-colouring",
		},
	},
];

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
