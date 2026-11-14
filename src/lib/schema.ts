import {
	POST_CATEGORY_LABELS,
	type PostDetail,
} from '@/components/pages/blog/types';
import type { Program, ProgramBatch } from '@/components/pages/programs/types';
import type { FaqEntry } from '@/data/faqs';
import { absoluteUrl, canonicalUrl, type JsonLdObject } from './seo';
import { SITE } from './site';

export const ORGANIZATION_ID = absoluteUrl('/#organization');
export const WEBSITE_ID = absoluteUrl('/#website');

/* ----------------------------- Organization ----------------------------- */

/**
 * Site-wide entity graph. Included once in the root route so every page tells
 * search and answer engines the same story about who the academy is.
 */
export function organizationGraph(): JsonLdObject {
	return {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': ['EducationalOrganization', 'LocalBusiness'],
				'@id': ORGANIZATION_ID,
				name: SITE.name,
				alternateName: SITE.shortName,
				legalName: SITE.legalName,
				url: SITE.url,
				description: SITE.description,
				slogan: SITE.tagline,
				logo: {
					'@type': 'ImageObject',
					url: absoluteUrl(SITE.logo),
					width: 512,
					height: 512,
				},
				image: absoluteUrl(SITE.defaultOgImage),
				telephone: SITE.contact.phoneE164,
				email: SITE.contact.email,
				address: {
					'@type': 'PostalAddress',
					...SITE.contact.addressParts,
				},
				geo: {
					'@type': 'GeoCoordinates',
					latitude: SITE.geo.latitude,
					longitude: SITE.geo.longitude,
				},
				openingHoursSpecification: [
					{
						'@type': 'OpeningHoursSpecification',
						dayOfWeek: [...SITE.contact.hours.dayOfWeek],
						opens: SITE.contact.hours.opens,
						closes: SITE.contact.hours.closes,
					},
				],
				areaServed: [...SITE.areaServed],
				sameAs: [...SITE.sameAs],
				hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.contact.address)}`,
				contactPoint: {
					'@type': 'ContactPoint',
					contactType: 'admissions',
					telephone: SITE.contact.phoneE164,
					email: SITE.contact.email,
					areaServed: 'BD',
				},
				priceRange: SITE.priceRange,
				currenciesAccepted: 'BDT',
				paymentAccepted: 'Cash, bKash, Nagad, Bank transfer, Card',
				knowsAbout: [
					'Barbering',
					'Hair styling',
					'Hair colouring',
					'Makeup artistry',
					'Beauty and styling training',
					'Job placement for barbers',
				],
			},
			{
				'@type': 'WebSite',
				'@id': WEBSITE_ID,
				url: SITE.url,
				name: SITE.name,
				description: SITE.description,
				inLanguage: 'en',
				publisher: { '@id': ORGANIZATION_ID },
			},
		],
	};
}

/* ------------------------------ Web pages ------------------------------- */

type WebPageType =
	| 'WebPage'
	| 'AboutPage'
	| 'ContactPage'
	| 'CollectionPage'
	| 'ProfilePage';

export function webPageSchema({
	type = 'WebPage',
	name,
	description,
	path,
	breadcrumb,
}: {
	type?: WebPageType;
	name: string;
	description: string;
	path: string;
	breadcrumb?: ReturnType<typeof breadcrumbSchema>;
}): JsonLdObject {
	const url = canonicalUrl(path);

	return {
		'@context': 'https://schema.org',
		'@type': type,
		'@id': `${url}#webpage`,
		url,
		name,
		description,
		inLanguage: 'en',
		isPartOf: { '@id': WEBSITE_ID },
		publisher: { '@id': ORGANIZATION_ID },
		...(breadcrumb ? { breadcrumb } : {}),
	};
}

export function breadcrumbSchema(
	items: Array<{ name: string; path: string }>,
): JsonLdObject {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		})),
	};
}

export function itemListSchema({
	name,
	path,
	items,
}: {
	name: string;
	path: string;
	items: Array<{ name: string; path: string; description?: string }>;
}): JsonLdObject {
	const url = canonicalUrl(path);

	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		'@id': `${url}#itemlist`,
		name,
		url,
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: absoluteUrl(item.path),
			...(item.description ? { description: item.description } : {}),
		})),
	};
}

/* --------------------------------- FAQ ---------------------------------- */

export function faqPageSchema(faqs: FaqEntry[], path = '/'): JsonLdObject {
	const url = canonicalUrl(path);

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'@id': `${url}#faq`,
		url,
		inLanguage: 'en',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.answer,
			},
		})),
	};
}

/* -------------------------------- Courses ------------------------------- */

export function courseSchema(
	program: Program,
	batches: ProgramBatch[],
	path: string,
): JsonLdObject {
	const url = canonicalUrl(path);
	const openBatches = batches.filter(
		(batch) => batch.status === 'upcoming' || batch.status === 'running',
	);
	const hasSeats = openBatches.some((batch) => !batch.isFull);
	const prerequisite =
		program.level === 'Beginner friendly'
			? 'No prior experience required'
			: program.level === 'Intermediate'
				? 'Prior barbering or salon experience recommended'
				: 'Open to all experience levels';

	return {
		'@context': 'https://schema.org',
		'@type': 'Course',
		'@id': `${url}#course`,
		name: program.title,
		description: `${program.tagline} ${program.description}`,
		url,
		image: absoluteUrl(SITE.defaultOgImage),
		inLanguage: 'en',
		educationalLevel: program.level,
		teaches: [...program.highlights],
		about: program.category,
		coursePrerequisites: prerequisite,
		educationalCredentialAwarded:
			'NTVQF-aligned certificate recognised by the Bangladesh Technical Education Board (BTEB)',
		syllabusSections: program.curriculum.map((module) => ({
			'@type': 'Syllabus',
			name: module.title,
			description: module.description,
		})),
		provider: {
			'@type': 'EducationalOrganization',
			'@id': ORGANIZATION_ID,
			name: SITE.name,
			url: SITE.url,
		},
		offers: {
			'@type': 'Offer',
			category: 'Paid',
			price: program.price,
			priceCurrency: 'BDT',
			url,
			availability: hasSeats
				? 'https://schema.org/InStock'
				: 'https://schema.org/SoldOut',
		},
		hasCourseInstance: openBatches.map((batch) => ({
			'@type': 'CourseInstance',
			name: batch.name,
			courseMode: 'onsite',
			startDate: batch.startDate,
			...(batch.endDate ? { endDate: batch.endDate } : {}),
			maximumAttendeeCapacity: batch.capacity,
			remainingAttendeeCapacity: batch.seatsRemaining,
			location: {
				'@type': 'Place',
				name: SITE.name,
				address: {
					'@type': 'PostalAddress',
					...SITE.contact.addressParts,
				},
			},
		})),
		occupationalCategory: [...program.careerPaths],
	};
}

/* -------------------------------- Articles ------------------------------ */

function htmlToWordCount(html: string): number {
	return html
		.replace(/<[^>]+>/g, ' ')
		.split(/\s+/)
		.filter(Boolean).length;
}

export function articleSchema(post: PostDetail, path: string): JsonLdObject {
	const url = canonicalUrl(path);

	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: post.title,
		description: post.excerpt ?? post.title,
		url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		isPartOf: { '@id': WEBSITE_ID },
		image: [absoluteUrl(post.coverImage || SITE.defaultOgImage)],
		...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
		dateModified: post.updatedAt,
		author: {
			'@type': 'Person',
			name: post.authorName,
		},
		publisher: { '@id': ORGANIZATION_ID },
		articleSection: POST_CATEGORY_LABELS[post.category],
		keywords: post.tags.join(', '),
		wordCount: htmlToWordCount(post.bodyHtml),
		timeRequired: `PT${post.readingMinutes}M`,
		isAccessibleForFree: true,
		inLanguage: 'en',
	};
}
