import { createFileRoute } from "@tanstack/react-router";
import { CardGridSkeleton } from "@/components/route-skeletons";
import { SITE_URL } from "@/data/site";
import { StudentLifePage } from "@/features/student-life/student-life-page";
import { listGalleryFn } from "@/server/content/content-fns";

export const Route = createFileRoute("/student-life")({
	loader: async () => ({ gallery: await listGalleryFn() }),
	staleTime: 60_000,
	pendingComponent: () => <CardGridSkeleton count={6} />,
	component: StudentLifeRoute,
	head: () => ({
		meta: [
			{ title: "Student Life | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"See what it's like to train at Unicorn Barber Training Academy — studio sessions, cohort bonding, graduation days, and the journey from student to professional.",
			},
			{
				property: "og:title",
				content: "Student Life | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Studio sessions, cohort bonding, and graduation days at Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/student-life` },
			{ property: "og:image", content: `${SITE_URL}/banner.png` },
			{
				name: "twitter:title",
				content: "Student Life | Unicorn Barber Training Academy",
			},
			{
				name: "twitter:description",
				content:
					"Studio sessions, cohort bonding, and graduation days at Unicorn Barber Training Academy.",
			},
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/student-life` }],
	}),
});

function StudentLifeRoute() {
	const { gallery } = Route.useLoaderData();
	return <StudentLifePage gallery={gallery} />;
}
