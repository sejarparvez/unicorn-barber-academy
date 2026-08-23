import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { CareersPage } from "@/features/careers/careers-page";

export const Route = createFileRoute("/careers")({
	component: CareersPage,
	head: () => ({
		meta: [
			{ title: "Careers | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Join the Unicorn Barber Training Academy team — we hire working professionals as instructors and studio staff. No teaching experience required.",
			},
			{
				property: "og:title",
				content: "Careers | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"We hire working professionals as instructors. No teaching experience required — just a chair you're proud of.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/careers` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/careers` }],
	}),
});
