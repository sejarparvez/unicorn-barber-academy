import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { BlogPage } from "@/features/blog/blog-page";

export const Route = createFileRoute("/blog")({
	component: BlogPage,
	head: () => ({
		meta: [
			{ title: "Blog | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Articles on barbering technique, beauty careers, and professional training in Dhaka from Unicorn Barber Training Academy.",
			},
			{
				property: "og:title",
				content: "Blog | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Articles on barbering technique, beauty careers, and professional training in Dhaka.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/blog` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
	}),
});
