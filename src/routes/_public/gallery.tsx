import { createFileRoute } from '@tanstack/react-router';
import GalleryCta from '@/components/pages/gallery/cta';
import GalleryGrid from '@/components/pages/gallery/grid';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getProgramOptions } from '@/server/programs';

const TITLE = 'Student Work & Gallery | Unicorn Barber Academy, Dhaka';
const DESCRIPTION =
	'Browse student work, live floor practice and classroom moments from Unicorn Barber Training Academy in Banasree, Dhaka — barbering, styling, colour and makeup.';

export const Route = createFileRoute('/_public/gallery')({
	loader: () => getProgramOptions(),
	head: () => {
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Gallery', path: '/gallery' },
		]);
		const seo = pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/gallery',
			keywords: [
				'barber student work',
				'barbering gallery Dhaka',
				'makeup student portfolio',
			],
			jsonLd: [
				webPageSchema({
					type: 'CollectionPage',
					name: TITLE,
					description: DESCRIPTION,
					path: '/gallery',
					breadcrumb,
				}),
			],
		});

		return {
			...seo,
			links: [
				...seo.links,
				// Gallery previews are served from Unsplash's imgix CDN.
				{ rel: 'preconnect', href: 'https://images.unsplash.com' },
				{ rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
			],
		};
	},
	component: Gallery,
});

function Gallery() {
	const programs = Route.useLoaderData();

	return (
		<main>
			<GalleryGrid programs={programs} />
			<GalleryCta />
		</main>
	);
}
