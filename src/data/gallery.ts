export const GALLERY_FILTERS = [
	'All',
	'Barbering',
	'Styling',
	'Makeup',
	'The floor',
] as const;

export type GalleryFilter = (typeof GALLERY_FILTERS)[number];

export type GalleryCategory = Exclude<GalleryFilter, 'All'>;

export type GalleryImage = {
	id: string;
	src: string;
	alt: string;
	caption: string;
	category: GalleryCategory;
	/** Intrinsic size, used by unpic to keep the masonry proportions honest. */
	width: number;
	height: number;
	programSlug?: string;
};

// TODO: replace with permissioned academy photography before launch.
// Preview imagery is served from Unsplash's imgix CDN, which unpic detects
// automatically and resizes for each breakpoint.
const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const GALLERY_IMAGES: GalleryImage[] = [
	{
		id: 'photo-1503951914875-452162b0f3f1',
		src: unsplash('photo-1503951914875-452162b0f3f1'),
		alt: 'A barber uses scissors and comb to shape a client’s hair.',
		caption: 'Scissor work on the floor',
		category: 'Barbering',
		width: 4858,
		height: 3239,
		programSlug: 'classic-barbering',
	},
	{
		id: 'photo-1621605815971-fbc98d665033',
		src: unsplash('photo-1621605815971-fbc98d665033'),
		alt: 'Clipper work during a barbering class.',
		caption: 'Clipper work and fade detail',
		category: 'Barbering',
		width: 5760,
		height: 3840,
		programSlug: 'fades-and-tapers',
	},
	{
		id: 'photo-1599351431202-1e0f0137899a',
		src: unsplash('photo-1599351431202-1e0f0137899a'),
		alt: 'Close-up of beard and straight-razor detailing.',
		caption: 'Beard and razor detail',
		category: 'Barbering',
		width: 4016,
		height: 6016,
		programSlug: 'beard-sculpting',
	},
	{
		id: 'photo-1532710093739-9470acff878f',
		src: unsplash('photo-1532710093739-9470acff878f'),
		alt: 'A barber checks the finished shape of a client’s haircut.',
		caption: 'Finishing the cut',
		category: 'Barbering',
		width: 4272,
		height: 2848,
		programSlug: 'classic-barbering',
	},
	{
		id: 'photo-1512690459411-b9245aed614b',
		src: unsplash('photo-1512690459411-b9245aed614b'),
		alt: 'A stylist shapes a client’s hair in the salon.',
		caption: 'Cutting and shaping',
		category: 'Styling',
		width: 5184,
		height: 3456,
		programSlug: 'hair-styling-and-colouring',
	},
	{
		id: 'photo-1522337360788-8b13dee7a37e',
		src: unsplash('photo-1522337360788-8b13dee7a37e'),
		alt: 'Blow-dry and finishing work at a styling station.',
		caption: 'Blow-dry finish',
		category: 'Styling',
		width: 6016,
		height: 4016,
		programSlug: 'hair-styling-and-colouring',
	},
	{
		id: 'photo-1493256338651-d82f7acb2b38',
		src: unsplash('photo-1493256338651-d82f7acb2b38'),
		alt: 'Colour and styling work in progress in the salon.',
		caption: 'Colour and styling',
		category: 'Styling',
		width: 5472,
		height: 3648,
		programSlug: 'hair-styling-and-colouring',
	},
	{
		id: 'photo-1560066984-138dadb4c035',
		src: unsplash('photo-1560066984-138dadb4c035'),
		alt: 'A stylist works at a salon station.',
		caption: 'Salon station',
		category: 'Styling',
		width: 4032,
		height: 3024,
		programSlug: 'hair-styling-and-colouring',
	},
	{
		id: 'photo-1487412947147-5cebf100ffc2',
		src: unsplash('photo-1487412947147-5cebf100ffc2'),
		alt: 'Makeup brushes and products laid out for a session.',
		caption: 'Kit prep',
		category: 'Makeup',
		width: 4088,
		height: 2725,
		programSlug: 'bridal-and-editorial-makeup',
	},
	{
		id: 'photo-1596462502278-27bfdc403348',
		src: unsplash('photo-1596462502278-27bfdc403348'),
		alt: 'Professional makeup products arranged for a class.',
		caption: 'The makeup kit',
		category: 'Makeup',
		width: 2500,
		height: 2500,
		programSlug: 'bridal-and-editorial-makeup',
	},
	{
		id: 'photo-1526045478516-99145907023c',
		src: unsplash('photo-1526045478516-99145907023c'),
		alt: 'Makeup products and tools for bridal and editorial work.',
		caption: 'Bridal and editorial',
		category: 'Makeup',
		width: 5472,
		height: 3648,
		programSlug: 'bridal-and-editorial-makeup',
	},
	{
		id: 'photo-1585747860715-2ba37e788b70',
		src: unsplash('photo-1585747860715-2ba37e788b70'),
		alt: 'Barbershop chairs and mirrors in the training salon.',
		caption: 'The shop floor',
		category: 'The floor',
		width: 4288,
		height: 2848,
	},
	{
		id: 'photo-1521590832167-7bcbfaa6381f',
		src: unsplash('photo-1521590832167-7bcbfaa6381f'),
		alt: 'Barbering stations set up for a class.',
		caption: 'Training stations',
		category: 'The floor',
		width: 4038,
		height: 2692,
	},
	{
		id: 'photo-1516975080664-ed2fc6a32937',
		src: unsplash('photo-1516975080664-ed2fc6a32937'),
		alt: 'A barber at work on the academy floor.',
		caption: 'Live floor practice',
		category: 'The floor',
		width: 4096,
		height: 2731,
	},
	{
		id: 'photo-1622286342621-4bd786c2447c',
		src: unsplash('photo-1622286342621-4bd786c2447c'),
		alt: 'A client in the chair during a supervised training session.',
		caption: 'Chair time',
		category: 'The floor',
		width: 4320,
		height: 2880,
	},
];
