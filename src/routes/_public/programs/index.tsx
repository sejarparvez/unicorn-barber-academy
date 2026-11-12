import { createFileRoute } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramsHero from '@/components/pages/programs/hero';
import ProgramsIncluded from '@/components/pages/programs/included';
import ProgramsList from '@/components/pages/programs/list';
import { getPrograms } from '@/server/programs';

export const Route = createFileRoute('/_public/programs/')({
	loader: () => getPrograms(),
	head: () => ({
		meta: [
			{ title: 'Programs — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Explore six hands-on career programs in barbering, styling, colour and makeup at Unicorn Barber Training Academy in Banasree, Dhaka. Full kits, small cohorts and placement support.',
			},
		],
	}),
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
