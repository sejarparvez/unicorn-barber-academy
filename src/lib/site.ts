/**
 * Single source of truth for all business/NAP information. Every SEO surface
 * (canonical URLs, Open Graph, JSON-LD, llms.txt, sitemap) reads from here so
 * the signals Google, answer engines and LLMs see always match the site.
 */

const FALLBACK_SITE_URL = 'https://unicornbarberacademy.com';

const SOCIALS = {
	instagram: 'https://www.instagram.com/unicornbarbertrainingacademy',
	facebook: 'https://www.facebook.com/unicornbarberacademy',
	youtube: 'https://www.youtube.com/@UnicornBarberTrainingAcademy',
	tiktok: 'https://www.tiktok.com/@unicorntrainingacademy',
	x: 'https://x.com/unicorntraining',
} as const;

export const SITE = {
	name: 'Unicorn Barber Training Academy',
	shortName: 'Unicorn Academy',
	legalName: 'Unicorn Barber Training Academy',
	/** Production origin used for canonical URLs. Never falls back to localhost. */
	url: (import.meta.env.VITE_SITE_URL || FALLBACK_SITE_URL).replace(/\/+$/, ''),
	description:
		'Hands-on barbering, hair styling, colour and makeup training in Banasree, Dhaka. Working instructors, full kits, day and evening cohorts, job placement.',
	tagline: 'Learn the craft. Earn the chair.',
	logo: '/icon-512.png',
	defaultOgImage: '/og-default.jpg',
	themeColor: '#0d0d0f',
	priceRange: '৳৳',
	contact: {
		email: 'info@unicornbarberacademy.com',
		phone: '01337-229944',
		// International format for tel: and wa.me links.
		phoneE164: '+8801337229944',
		whatsapp: '8801337229944',
		address:
			'House 04 (1st Floor), Block F, Main Road, Banasree, Rampura, Dhaka',
		addressParts: {
			streetAddress:
				'House 04 (1st Floor), Block F, Main Road, Banasree, Rampura',
			addressLocality: 'Dhaka',
			addressRegion: 'Dhaka',
			postalCode: '1219',
			addressCountry: 'BD',
		},
		hours: {
			days: 'Saturday – Thursday',
			time: '11:00 AM – 10:00 PM',
			/** Schema.org `DayOfWeek` values. Friday is the weekly closure. */
			dayOfWeek: [
				'Saturday',
				'Sunday',
				'Monday',
				'Tuesday',
				'Wednesday',
				'Thursday',
			],
			opens: '11:00',
			closes: '22:00',
		},
	},
	/** Approximate campus coordinates (Banasree, Rampura, Dhaka). */
	geo: {
		latitude: 23.7669,
		longitude: 90.4243,
	},
	areaServed: ['Banasree', 'Rampura', 'Dhaka', 'Bangladesh'],
	socials: SOCIALS,
	sameAs: Object.values(SOCIALS),
	xHandle: '@unicorntraining',
	/** Factual claims reused in copy and structured data. Keep them defensible. */
	facts: {
		programCount: 6,
		hiringPartners: '60+',
		cohortTimes: 2,
		certification:
			'Certificates are issued under the National Technical and Vocational Qualification Framework (NTVQF) and recognised by the Bangladesh Technical Education Board (BTEB).',
	},
} as const;
