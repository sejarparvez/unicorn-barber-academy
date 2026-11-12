import { createFileRoute } from '@tanstack/react-router';
import GalleryCta from '@/components/pages/gallery/cta';
import GalleryGrid from '@/components/pages/gallery/grid';
import { getProgramOptions } from '@/server/programs';

export const Route = createFileRoute('/_public/gallery')({
	loader: () => getProgramOptions(),
	head: () => ({
		meta: [
			{ title: 'Gallery — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Browse student work, live floor practice and classroom moments from Unicorn Barber Training Academy in Banasree, Dhaka — barbering, styling, colour and makeup.',
			},
		],
	}),
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
