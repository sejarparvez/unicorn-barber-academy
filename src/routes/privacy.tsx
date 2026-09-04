import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { PrivacyPage } from "@/features/legal/privacy-page";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
	head: () => ({
		meta: [
			{ title: "Privacy Policy | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Privacy policy for Unicorn Barber Training Academy — how we collect, use, and protect your personal information.",
			},
			{
				property: "og:title",
				content: "Privacy Policy | Unicorn Barber Training Academy",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/privacy` },
			{ property: "og:image", content: `${SITE_URL}/banner.png` },
			{
				property: "og:description",
				content:
					"Privacy policy for Unicorn Barber Training Academy — how we collect, use, and protect your personal information.",
			},
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
	}),
});
