import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { InstructorsPage } from "@/features/instructors/instructors-page";
import { listInstructorsFn } from "@/server/content-fns";

export const Route = createFileRoute("/instructors")({
	loader: async () => ({ instructors: await listInstructorsFn() }),
	component: InstructorsRoute,
	head: () => ({
		meta: [
			{ title: "Instructors | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Meet the working barbers and beauty professionals teaching at Unicorn Barber Training Academy in Dhaka — every instructor still works a chair or a station.",
			},
			{
				property: "og:title",
				content: "Instructors | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Meet the working professionals teaching every program at Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/instructors` },
			{ property: "og:image", content: `${SITE_URL}/banner.png` },
			{
				name: "twitter:title",
				content: "Instructors | Unicorn Barber Training Academy",
			},
			{
				name: "twitter:description",
				content:
					"Meet the working professionals teaching every program at Unicorn Barber Training Academy.",
			},
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/instructors` }],
	}),
});

function InstructorsRoute() {
	const { instructors } = Route.useLoaderData();
	return <InstructorsPage instructors={instructors} />;
}
