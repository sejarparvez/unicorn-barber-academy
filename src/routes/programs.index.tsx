import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "@/data/site";

import { ProgramsPage } from "@/features/programs/programs-page";

export const Route = createFileRoute("/programs/")({
	component: ProgramsPage,
	head: () => ({
		meta: [
			{ title: "Programs | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Six hands-on barbering and beauty & cosmetology programs in Dhaka — from 4-week specialisations to full 16-week certifications. Day and evening cohorts available.",
			},
			{
				property: "og:title",
				content: "Programs | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Six hands-on barbering and beauty & cosmetology programs, taught by working professionals in Dhaka.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/programs` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/programs` }],
	}),
});
