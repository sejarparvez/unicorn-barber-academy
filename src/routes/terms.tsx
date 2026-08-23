import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { TermsPage } from "@/features/legal/terms-page";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
	head: () => ({
		meta: [
			{ title: "Terms of Service | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Terms of service for Unicorn Barber Training Academy — governing your use of our website and enrollment in our programs.",
			},
			{
				property: "og:title",
				content: "Terms of Service | Unicorn Barber Training Academy",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/terms` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
	}),
});
