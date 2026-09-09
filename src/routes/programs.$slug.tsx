// routes/programs.$slug.tsx
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticleSkeleton } from "@/components/route-skeletons";
import { getProgramBySlug } from "@/data/programs";
import { SITE_URL } from "@/data/site";
import {
	ProgramDetailPage,
	ProgramNotFound,
} from "@/features/programs/program-detail-page";
import { listInstructorsFn } from "@/server/content/content-fns";

export const Route = createFileRoute("/programs/$slug")({
	loader: async ({ params }) => {
		const program = getProgramBySlug(params.slug);
		if (!program) throw notFound();
		return { program, instructors: await listInstructorsFn() };
	},
	staleTime: 60_000,
	pendingComponent: ArticleSkeleton,
	head: ({ loaderData }) => {
		if (!loaderData) {
			return {
				meta: [
					{ title: "Program not found | Unicorn Barber Training Academy" },
					{ name: "robots", content: "noindex" },
				],
			};
		}
		const { program } = loaderData;
		const url = `${SITE_URL}${program.to}`;
		return {
			meta: [
				{ title: `${program.title} | Unicorn Barber Training Academy` },
				{ name: "description", content: program.description },
				{
					property: "og:title",
					content: `${program.title} | Unicorn Barber Training Academy`,
				},
				{ property: "og:description", content: program.description },
				{ property: "og:type", content: "website" },
				{ property: "og:url", content: url },
				// program.image is a bundled asset path (/assets/...); scrapers need
				// an absolute URL to resolve it.
				{
					property: "og:image",
					content: program.image.startsWith("http")
						? program.image
						: `${SITE_URL}${program.image}`,
				},
				{
					name: "twitter:title",
					content: `${program.title} | Unicorn Barber Training Academy`,
				},
				{
					name: "twitter:description",
					content: program.description,
				},
			],
			links: [{ rel: "canonical", href: url }],
		};
	},
	component: ProgramDetailPage,
	notFoundComponent: ProgramNotFound,
});
