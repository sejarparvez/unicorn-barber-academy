import { createFileRoute, notFound } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramCurriculum from '@/components/pages/programs/detail/curriculum';
import ProgramDetailHero from '@/components/pages/programs/detail/hero';
import RelatedPrograms from '@/components/pages/programs/detail/related';
import { getProgramBySlug, getRelatedPrograms } from '@/data/programs';

export const Route = createFileRoute('/_public/programs/$slug')({
	loader: ({ params }) => {
		const program = getProgramBySlug(params.slug);
		if (!program) {
			throw notFound();
		}
	},
	head: ({ params }) => {
		const program = getProgramBySlug(params.slug);

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
	const { slug } = Route.useParams();
	const program = getProgramBySlug(slug);

	if (!program) {
		return null;
	}

	const relatedPrograms = getRelatedPrograms(program.slug);

	return (
		<main>
			<ProgramDetailHero program={program} />
			<ProgramCurriculum program={program} />
			<RelatedPrograms programs={relatedPrograms} />
			<Cta />
		</main>
	);
}
