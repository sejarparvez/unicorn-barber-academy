import {
	IconBriefcase,
	IconBrush,
	IconMicroscope,
	IconPalette,
	IconRazor,
	IconScissors,
} from '@tabler/icons-react';

export const INSTRUCTOR_FILTERS = [
	'All',
	'Barbering',
	'Beauty & styling',
	'Makeup',
	'Careers',
] as const;

export type InstructorFilter = (typeof INSTRUCTOR_FILTERS)[number];

export type InstructorDepartment = Exclude<InstructorFilter, 'All'>;

export type Instructor = {
	slug: string;
	name: string;
	role: string;
	department: InstructorDepartment;
	years: number;
	icon: typeof IconScissors;
	specialties: string[];
	bio: string;
	quote: string;
	credential: string;
	programSlugs: string[];
};

// TODO: replace with the real faculty names, photos and credentials before launch.
export const INSTRUCTORS: Instructor[] = [
	{
		slug: 'arif-hossain',
		name: 'Arif Hossain',
		role: 'Founder & Lead Barbering Instructor',
		department: 'Barbering',
		years: 15,
		icon: IconScissors,
		specialties: ['Classic cuts', 'Skin fades', 'Straight razor'],
		bio: 'Arif opened the academy after fifteen years behind the chair. He still cuts five days a week and runs the foundation and fade modules himself.',
		quote:
			'A demo only matters if a student can repeat it tomorrow — without me standing there.',
		credential: 'NTVQF Level 4 · Master barber',
		programSlugs: ['classic-barbering', 'fades-and-tapers'],
	},
	{
		slug: 'rakibul-hasan',
		name: 'Rakibul Hasan',
		role: 'Senior Barbering Instructor',
		department: 'Barbering',
		years: 9,
		icon: IconRazor,
		specialties: ['Fades & tapers', 'Beard sculpting', 'Line-ups'],
		bio: 'Rakib specialises in the details that make a cut look sharp: clean tapers, tight line-ups and beards that fade into the sideburn without a seam.',
		quote:
			'Speed is a by-product of doing the same cut correctly a thousand times.',
		credential: 'NTVQF Level 3 · Barbering assessor',
		programSlugs: ['fades-and-tapers', 'beard-sculpting'],
	},
	{
		slug: 'tania-sultana',
		name: 'Tania Sultana',
		role: 'Colour & Styling Lead',
		department: 'Beauty & styling',
		years: 11,
		icon: IconPalette,
		specialties: ['Colour theory', 'Foiling & toning', 'Bridal styling'],
		bio: 'Tania turns colour theory into something students can mix, explain and defend. She leads the styling and colour floor and mentors the bridal teams.',
		quote:
			'If you cannot explain the colour plan to the client, you are not ready to mix it.',
		credential: 'NTVQF Level 4 · Colour specialist',
		programSlugs: ['hair-styling-and-colouring', 'bridal-and-editorial-makeup'],
	},
	{
		slug: 'farzana-akter',
		name: 'Farzana Akter',
		role: 'Cosmetology Instructor',
		department: 'Beauty & styling',
		years: 8,
		icon: IconMicroscope,
		specialties: ['Skin & scalp', 'Hair science', 'Salon hygiene'],
		bio: 'Farzana teaches the science underneath the service — skin and scalp health, hair structure, product chemistry and the hygiene standards that keep a salon safe.',
		quote:
			'Knowing why a product works is what separates a stylist from someone following a recipe.',
		credential: 'BSc Cosmetology · Salon educator',
		programSlugs: ['cosmetology-fundamentals'],
	},
	{
		slug: 'sadia-karim',
		name: 'Sadia Karim',
		role: 'Makeup Artistry Lead',
		department: 'Makeup',
		years: 10,
		icon: IconBrush,
		specialties: ['Bridal looks', 'Editorial', 'Long-wear finish'],
		bio: 'Sadia builds bridal and editorial looks from skin prep up. She teaches longevity, lighting and the calm wedding-day timeline that clients actually remember.',
		quote:
			'A look is not finished until it survives the photographs and the last dance.',
		credential: 'Pro artist · Bridal & editorial',
		programSlugs: ['bridal-and-editorial-makeup'],
	},
	{
		slug: 'moinul-islam',
		name: 'Moinul Islam',
		role: 'Career & Placement Lead',
		department: 'Careers',
		years: 7,
		icon: IconBriefcase,
		specialties: ['Portfolios', 'Interviews', 'Salon network'],
		bio: 'Moinul knows which shops are hiring and what they look for behind the chair. He runs portfolio reviews, mock interviews and the introductions that turn training into a chair.',
		quote:
			'The interview starts long before you sit down — it starts with the cuts in your portfolio.',
		credential: '60+ hiring partners',
		programSlugs: [],
	},
];
