export type SeedProgram = {
	slug: string;
	title: string;
	category: string;
	level: string;
	duration: string;
	schedule: string;
	tagline: string;
	description: string;
	highlights: string[];
	outcome: string;
	curriculum: { title: string; description: string }[];
	whoFor: string[];
	careerPaths: string[];
	/** Course price in BDT. */
	price: number;
	featured?: boolean;
};

export const SEED_PROGRAMS: SeedProgram[] = [
	{
		slug: 'classic-barbering',
		title: 'Classic Barbering',
		category: 'Barbering',
		level: 'Beginner friendly',
		duration: '12 weeks',
		schedule: 'Day & evening',
		tagline: 'Foundations, fades and classic cuts',
		description:
			'Start from your first grip and finish with the full barbering toolkit: sectioning, clipper work, classic cuts, tapers and the final blend.',
		highlights: ['Clipper & shear work', 'Classic cuts', 'Live client days'],
		outcome:
			'Leave ready for a junior chair, with a portfolio of cuts and the confidence to handle a walk-in.',
		curriculum: [
			{
				title: 'Foundations & tool craft',
				description:
					'Grip, posture, sectioning and the safe, controlled use of clippers and shears.',
			},
			{
				title: 'Classic cutting',
				description:
					'Scissor-over-comb, one-length cuts, layers, tapers and clean, invisible blending.',
			},
			{
				title: 'Fades & finishing',
				description:
					'Fade theory, line-ups, neck and edge work, and a finish that holds through the day.',
			},
			{
				title: 'Floor & live clients',
				description:
					'Supervised model and client work, consultation, timing and portfolio shots.',
			},
		],
		whoFor: [
			'Complete beginners who want a career behind the chair.',
			'Career changers who need a full foundation, not a weekend taster.',
			'Working stylists who want structured barbering training.',
		],
		careerPaths: [
			'Junior barber in a shop or salon',
			'Mobile barber building their own client book',
			'Further study in fades, beard work or colour',
		],
		price: 48000,
		featured: true,
	},
	{
		slug: 'fades-and-tapers',
		title: 'Fades & Tapers',
		category: 'Barbering',
		level: 'Intermediate',
		duration: '8 weeks',
		schedule: 'Day & evening',
		tagline: 'Precision fade work and clean transitions',
		description:
			'Drill the fade until the transitions disappear. Skin fades, taper blending, line-ups and the small details that separate a good cut from a sharp one.',
		highlights: ['Skin fades', 'Taper blending', 'Sharp line-ups'],
		outcome:
			'Cut consistent fades at speed, read a head before you start, and fix your own mistakes without panicking.',
		curriculum: [
			{
				title: 'Fade theory',
				description:
					'Head shape, gradient zones, guard numbers and the geometry behind a clean transition.',
			},
			{
				title: 'Skin & bald fades',
				description:
					'Clipper-over-comb, balding, foil blending and the detail work that makes a fade look sharp.',
			},
			{
				title: 'Tapers & necklines',
				description:
					'Taper transitions, neckline shaping, edge control and finishing without over-cutting.',
			},
			{
				title: 'Speed & live work',
				description:
					'Timed drills, live models and supervised correction so the cut holds up under pressure.',
			},
		],
		whoFor: [
			'Barbers who can cut but want cleaner, more consistent transitions.',
			"Stylists moving into men's grooming and fade work.",
			'Returning barbers refreshing their fade technique.',
		],
		careerPaths: [
			'Fade specialist in a high-volume barbershop',
			"Men's grooming stylist with a sharper service menu",
			'Mobile barber offering faster, cleaner cuts',
		],
		price: 42000,
		featured: true,
	},
	{
		slug: 'beard-sculpting',
		title: 'Beard Sculpting',
		category: 'Barbering',
		level: 'All levels',
		duration: '6 weeks',
		schedule: 'Day & evening',
		tagline: 'Shape, line and finish facial hair',
		description:
			'Work with clippers, razor detailing and hot-towel treatments to shape a beard that suits the face — then finish it so it holds its line.',
		highlights: ['Clipper shaping', 'Razor detailing', 'Hot-towel finish'],
		outcome:
			'Offer a complete beard service, from consultation and mapping to the final hot-towel finish.',
		curriculum: [
			{
				title: 'Face mapping',
				description:
					'Growth patterns, symmetry and choosing a beard shape that suits the jaw and lifestyle.',
			},
			{
				title: 'Clipper shaping',
				description:
					'Length work, freehand shaping and fading the beard cleanly into the sideburn.',
			},
			{
				title: 'Razor detailing',
				description:
					'Cheek and neck lines, precision work with a razor, and safe handling throughout.',
			},
			{
				title: 'Hot-towel finish',
				description:
					'Prep, lather, aftercare and the consultation that turns a trim into a full service.',
			},
		],
		whoFor: [
			'Barbers adding a complete beard service to their menu.',
			'Beginners who want a focused, practical grooming skill.',
			'Grooming specialists tightening their line and finish work.',
		],
		careerPaths: [
			'Barber offering full beard and grooming services',
			"Men's grooming specialist in a salon or shop",
			'Mobile or private grooming work',
		],
		price: 40000,
		featured: true,
	},
	{
		slug: 'cosmetology-fundamentals',
		title: 'Cosmetology Fundamentals',
		category: 'Beauty & styling',
		level: 'Beginner friendly',
		duration: '16 weeks',
		schedule: 'Day & evening',
		tagline: 'Skin, hair and beauty science for the salon floor',
		description:
			'Build the knowledge underneath the service: skin and scalp science, hair structure, product chemistry, hygiene and safe client handling.',
		highlights: ['Skin & scalp science', 'Hair anatomy', 'Salon hygiene'],
		outcome:
			'Understand why a treatment works, talk a client through it clearly, and spot when a service is not safe to perform.',
		curriculum: [
			{
				title: 'Skin & scalp science',
				description:
					'Structure, conditions and contraindications — what you can treat and what needs a referral.',
			},
			{
				title: 'Hair science',
				description:
					'Growth cycles, hair structure, porosity and how different products interact with the fibre.',
			},
			{
				title: 'Salon chemistry',
				description:
					'Ingredients, mixing, patch tests and safe storage for the products used on the floor.',
			},
			{
				title: 'Hygiene & client care',
				description:
					'Sanitation, consultation, record keeping and the communication that keeps clients coming back.',
			},
		],
		whoFor: [
			'Complete beginners who want the science before the service.',
			'Salon assistants who want to move onto the floor with confidence.',
			'Anyone moving into product education or salon management.',
		],
		careerPaths: [
			'Salon assistant or junior stylist',
			'Product advisor or brand educator',
			'Further study in styling, colour or makeup',
		],
		price: 46000,
	},
	{
		slug: 'hair-styling-and-colouring',
		title: 'Hair Styling & Colouring',
		category: 'Beauty & styling',
		level: 'All levels',
		duration: '12 weeks',
		schedule: 'Day & evening',
		tagline: 'Cutting, colour theory and modern styling',
		description:
			'Move from basic cutting into colour theory, mixing, application and modern styling — with the consultation skills to defend your choices in front of a client.',
		highlights: ['Colour theory', 'Cutting & styling', 'Client consultation'],
		outcome:
			'Deliver a full colour and styling service, from the consultation and patch test to the final blow-dry.',
		curriculum: [
			{
				title: 'Cutting foundations',
				description:
					'Sectioning, elevation, one-length and layered cuts — the shapes every style is built on.',
			},
			{
				title: 'Colour theory',
				description:
					'Undertones, developers, mixing and strand tests, with the vocabulary to explain the plan.',
			},
			{
				title: 'Application & lifting',
				description:
					'Root touch-ups, full colour, foils and toning, practised on models under supervision.',
			},
			{
				title: 'Styling & consultation',
				description:
					'Blow-dry, finishing, client consultation and the portfolio shots that show the work.',
			},
		],
		whoFor: [
			'Beginner stylists who want cutting and colour in one track.',
			'Barbers moving into longer hair and colour services.',
			'Working stylists refreshing their colour and finishing skills.',
		],
		careerPaths: [
			'Salon stylist or colourist',
			'Freelance styling for shoots and events',
			'Salon team lead or educator',
		],
		price: 50000,
	},
	{
		slug: 'bridal-and-editorial-makeup',
		title: 'Bridal & Editorial Makeup',
		category: 'Makeup',
		level: 'All levels',
		duration: '10 weeks',
		schedule: 'Day & evening',
		tagline: 'Client-ready looks for weddings and shoots',
		description:
			'Learn bridal and editorial makeup from the skin prep up: colour matching, longevity, lighting, and looks that photograph as well as they wear.',
		highlights: ['Bridal looks', 'Editorial makeup', 'Portfolio shoots'],
		outcome:
			'Build a bridal and editorial portfolio, quote for work confidently, and manage a wedding-day schedule.',
		curriculum: [
			{
				title: 'Skin prep & colour',
				description:
					'Undertone matching, primer, base and correction work for a finish that lasts.',
			},
			{
				title: 'Bridal looks',
				description:
					'Long-wear makeup, photography lighting, touch-up kits and the wedding-day timeline.',
			},
			{
				title: 'Editorial & creative',
				description:
					'Concept, texture, bold colour and shoot styling for work that photographs well.',
			},
			{
				title: 'Portfolio & business',
				description:
					'Test shoots, pricing, client communication and the details that make a booking run smoothly.',
			},
		],
		whoFor: [
			'Makeup beginners who want a clear, client-ready skill set.',
			'Salon artists adding bridal and event makeup services.',
			'Freelancers who need a portfolio and a repeatable process.',
		],
		careerPaths: [
			'Freelance bridal makeup artist',
			'Salon makeup specialist',
			'Editorial and shoot makeup work',
		],
		price: 45000,
	},
];
