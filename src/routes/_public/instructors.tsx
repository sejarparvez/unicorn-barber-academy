import { createFileRoute } from '@tanstack/react-router';
import InstructorsApproach from '@/components/pages/instructors/approach';
import InstructorsCta from '@/components/pages/instructors/cta';
import InstructorsHero from '@/components/pages/instructors/hero';
import InstructorsRoster from '@/components/pages/instructors/roster';
import { getProgramOptions } from '@/server/programs';

export const Route = createFileRoute('/_public/instructors')({
	loader: () => getProgramOptions(),
	head: () => ({
		meta: [
			{ title: 'Instructors — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Meet the working barbers, colourists and makeup artists who teach at Unicorn Barber Training Academy in Banasree, Dhaka. Small cohorts, live floor training and one-to-one correction.',
			},
		],
	}),
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
