import { createFileRoute, notFound } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramBatches from '@/components/pages/programs/detail/batches';
import ProgramCurriculum from '@/components/pages/programs/detail/curriculum';
import ProgramDetailHero from '@/components/pages/programs/detail/hero';
import RelatedPrograms from '@/components/pages/programs/detail/related';
import { getProgramBatches } from '@/server/batches';
import { getProgramBySlug, getRelatedPrograms } from '@/server/programs';

export const Route = createFileRoute('/_public/programs/$slug')({
	loader: async ({ params }) => {
		const program = await getProgramBySlug({ data: { slug: params.slug } });

		if (!program) {
			throw notFound();
		}

		const [relatedPrograms, batches] = await Promise.all([
			getRelatedPrograms({ data: { slug: params.slug } }),
			getProgramBatches({ data: { slug: params.slug } }),
		]);

		return { program, relatedPrograms, batches };
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
	const { program, relatedPrograms, batches } = Route.useLoaderData();

	return (
		<main>
			<ProgramDetailHero program={program} />
			<ProgramBatches programTitle={program.title} batches={batches} />
			<ProgramCurriculum program={program} />
			<RelatedPrograms programs={relatedPrograms} />
			<Cta />
		</main>
	);
}
