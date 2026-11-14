import { createFileRoute, notFound } from '@tanstack/react-router';
import Cta from '@/components/pages/home/cta';
import ProgramBatches from '@/components/pages/programs/detail/batches';
import ProgramCurriculum from '@/components/pages/programs/detail/curriculum';
import ProgramDetailHero from '@/components/pages/programs/detail/hero';
import RelatedPrograms from '@/components/pages/programs/detail/related';
import { breadcrumbSchema, courseSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
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
	head: ({ loaderData }) => {
		const program = loaderData?.program;

		if (!program) {
			return pageSeo({
				title: 'Program not found | Unicorn Barber Training Academy',
				description: 'This program could not be found.',
				path: '/programs',
				noindex: true,
			});
		}

		const path = `/programs/${program.slug}`;
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Programs', path: '/programs' },
			{ name: program.title, path },
		]);

		return pageSeo({
			title: `${program.title} Course in Dhaka | Unicorn Academy`,
			description: `${program.tagline} ${program.description}`,
			path,
			keywords: [
				program.title,
				program.category,
				program.level,
				'barber training Dhaka',
				'Bangladesh',
			],
			jsonLd: [
				courseSchema(program, loaderData?.batches ?? [], path),
				breadcrumb,
			],
		});
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
