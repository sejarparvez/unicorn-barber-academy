import { createFileRoute } from '@tanstack/react-router';
import InstructorsApproach from '@/components/pages/instructors/approach';
import InstructorsCta from '@/components/pages/instructors/cta';
import InstructorsHero from '@/components/pages/instructors/hero';
import InstructorsRoster from '@/components/pages/instructors/roster';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getProgramOptions } from '@/server/programs';

const TITLE = 'Barbering & Makeup Instructors in Dhaka | Unicorn Academy';
const DESCRIPTION =
	'Meet the working barbers, colourists and makeup artists who teach at Unicorn Barber Training Academy in Banasree, Dhaka. Small cohorts, live floor training and one-to-one correction.';

export const Route = createFileRoute('/_public/instructors')({
	loader: () => getProgramOptions(),
	head: () => {
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Instructors', path: '/instructors' },
		]);

		return pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/instructors',
			keywords: [
				'barbering instructors Dhaka',
				'makeup artists Dhaka',
				'barber school faculty',
			],
			jsonLd: [
				webPageSchema({
					type: 'CollectionPage',
					name: TITLE,
					description: DESCRIPTION,
					path: '/instructors',
					breadcrumb,
				}),
			],
		});
	},
	component: Instructors,
});

function Instructors() {
	const programs = Route.useLoaderData();

	return (
		<main>
			<InstructorsHero />
			<InstructorsRoster programs={programs} />
			<InstructorsApproach />
			<InstructorsCta />
		</main>
	);
}
