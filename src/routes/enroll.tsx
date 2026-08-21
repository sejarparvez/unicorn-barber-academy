import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site-data";

export const Route = createFileRoute("/enroll")({
	component: EnrollPage,
	head: () => ({
		meta: [
			{ title: "Enroll | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Apply to Unicorn Barber Training Academy — hands-on programs in barbering and beauty & cosmetology in Dhaka.",
			},
			{
				property: "og:title",
				content: "Enroll | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Apply to Unicorn Barber Training Academy — hands-on programs in barbering and beauty & cosmetology.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/enroll` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/enroll` }],
	}),
});

function EnrollPage() {
	return (
		<main className="mx-auto max-w-3xl px-6 py-24 text-center">
			<h1 className="font-heading text-4xl font-medium sm:text-5xl">Enroll</h1>
			<p className="mt-4 text-muted-foreground">
				This is the enroll page. The application experience is being rebuilt.
			</p>
		</main>
	);
}
