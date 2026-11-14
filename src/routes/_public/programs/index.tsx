import { createFileRoute } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramsHero from '@/components/pages/programs/hero';
import ProgramsIncluded from '@/components/pages/programs/included';
import ProgramsList from '@/components/pages/programs/list';
import { breadcrumbSchema, itemListSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getPrograms } from '@/server/programs';

const TITLE = 'Barbering, Styling & Makeup Programs in Dhaka | Unicorn';
const DESCRIPTION =
	'Explore hands-on career programs in barbering, hair styling, colour and makeup at Unicorn Barber Training Academy in Banasree, Dhaka. Full kits, small cohorts and placement support.';

export const Route = createFileRoute('/_public/programs/')({
	loader: () => getPrograms(),
	head: ({ loaderData }) => {
		const programs = loaderData ?? [];
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Programs', path: '/programs' },
		]);

		return pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/programs',
			keywords: [
				'barbering course Dhaka',
				'hair styling course Dhaka',
				'makeup course Dhaka',
				'barber school Bangladesh',
			],
			jsonLd: [
				webPageSchema({
					type: 'CollectionPage',
					name: TITLE,
					description: DESCRIPTION,
					path: '/programs',
					breadcrumb,
				}),
				...(programs.length
					? [
							itemListSchema({
								name: 'Career programs',
								path: '/programs',
								items: programs.map((program) => ({
									name: program.title,
									path: `/programs/${program.slug}`,
									description: program.tagline,
								})),
							}),
						]
					: []),
			],
		});
	},
	component: Programs,
});

function Programs() {
	const programs = Route.useLoaderData();

	return (
		<main>
			<ProgramsHero programs={programs} />
			<ProgramsList programs={programs} />
			<ProgramsIncluded />
			<Cta />
		</main>
	);
}
