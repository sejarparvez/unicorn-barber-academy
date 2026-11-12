import { createFileRoute, notFound } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramCurriculum from '@/components/pages/programs/detail/curriculum';
import ProgramDetailHero from '@/components/pages/programs/detail/hero';
import RelatedPrograms from '@/components/pages/programs/detail/related';
import { getProgramBySlug, getRelatedPrograms } from '@/server/programs';

export const Route = createFileRoute('/_public/programs/$slug')({
	loader: async ({ params }) => {
		const program = await getProgramBySlug({ data: { slug: params.slug } });

		if (!program) {
			throw notFound();
		}

		const relatedPrograms = await getRelatedPrograms({
			data: { slug: params.slug },
		});

		return { program, relatedPrograms };
	},
	head: ({ match }) => {
		const program = match.loaderData?.program;

		if (!program) {
			return {
				meta: [
					{ title: 'Program not found — Unicorn Barber Training Academy' },
				],
			};
		}

		return {
			meta: [
				{ title: `${program.title} — Unicorn Barber Training Academy` },
				{ name: 'description', content: program.description },
			],
		};
	},
	component: ProgramDetail,
});

function ProgramDetail() {
	const { program, relatedPrograms } = Route.useLoaderData();

	return (
		<main>
			<ProgramDetailHero program={program} />
			<ProgramCurriculum program={program} />
			<RelatedPrograms programs={relatedPrograms} />
			<Cta />
		</main>
	);
}
