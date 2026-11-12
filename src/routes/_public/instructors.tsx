import { createFileRoute } from '@tanstack/react-router';
import InstructorsApproach from '@/components/pages/instructors/approach';
import InstructorsCta from '@/components/pages/instructors/cta';
import InstructorsHero from '@/components/pages/instructors/hero';
import InstructorsRoster from '@/components/pages/instructors/roster';

export const Route = createFileRoute('/_public/instructors')({
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
	return (
		<main>
			<InstructorsHero />
			<InstructorsRoster />
			<InstructorsApproach />
			<InstructorsCta />
		</main>
	);
}
