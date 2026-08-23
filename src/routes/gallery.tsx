import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/data/site";
import { GalleryPage } from "@/features/gallery/gallery-page";

export const Route = createFileRoute("/gallery")({
	component: GalleryPage,
	head: () => ({
		meta: [
			{ title: "Gallery | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"See the work: before-and-after transformations, studio sessions, and graduation days from Unicorn Barber Training Academy in Dhaka.",
			},
			{
				property: "og:title",
				content: "Gallery | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Before-and-after transformations and studio life from Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/gallery` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/gallery` }],
	}),
});
