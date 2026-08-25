import { createFileRoute } from "@tanstack/react-router";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";
import { AboutPage } from "@/features/about/about-page";

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: "About Us | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Unicorn Barber Training Academy — Dhaka's premier hands-on training academy for barbering and beauty & cosmetology. NTVQF certified, guild registered.",
			},
			{
				property: "og:title",
				content: "About Us | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Dhaka's premier hands-on training academy for barbering and beauty & cosmetology.",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:image",
				content: `${SITE_URL}${pic("unicorn-about-story", 800, 600)}`,
			},
			{ property: "og:url", content: `${SITE_URL}/about` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
	}),
});
