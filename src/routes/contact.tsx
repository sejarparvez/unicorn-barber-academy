import { createFileRoute } from "@tanstack/react-router";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";
import { ContactPage } from "@/features/contact/contact-page";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
	head: () => ({
		meta: [
			{ title: "Contact | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Get in touch with Unicorn Barber Training Academy in Banasree, Rampura, Dhaka — admissions, salon partnerships, press, or a studio visit.",
			},
			{
				property: "og:title",
				content: "Contact | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Reach admissions, partnerships, or press at Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{
				property: "og:image",
				content: `${SITE_URL}${pic("unicorn-contact-hero-1", 900, 1000)}`,
			},
			{ property: "og:url", content: `${SITE_URL}/contact` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
	}),
});
