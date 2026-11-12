import { createFileRoute } from '@tanstack/react-router';
import GalleryCta from '@/components/pages/gallery/cta';
import GalleryGrid from '@/components/pages/gallery/grid';

export const Route = createFileRoute('/_public/gallery')({
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
	return (
		<main>
			<GalleryGrid />
			<GalleryCta />
		</main>
	);
}
