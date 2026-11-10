import { createFileRoute } from "@tanstack/react-router";
import banner480 from "@/assets/logo/banner-480.webp";
import banner640 from "@/assets/logo/banner-640.webp";
import banner768 from "@/assets/logo/banner-768.webp";
import banner896 from "@/assets/logo/banner-896.webp";
import HomePage from "@/components/pages/home/home-page";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";

export const Route = createFileRoute("/")({
	// No route loader on purpose: the hero (and LCP image) is fully static,
	// so HomePage renders and streams immediately while the DB-backed sections
	// below resolve independently behind Suspense. A loader would hold the
	// entire page — LCP included — on four content queries.
	component: HomePage,
	head: () => ({
		meta: [
			{
				title:
					"Unicorn Barber Training Academy | Barbering & Beauty Courses in Dhaka",
			},
			{
				name: "description",
				content:
					"Barbering & beauty training in Dhaka — working-professional instructors, full kit included, job placement support. Enroll now.",
			},
			{ name: "robots", content: "index, follow" },
			{ property: "og:title", content: "Unicorn Barber Training Academy" },
			{
				property: "og:description",
				content:
					"Barbering & beauty training in Dhaka — working-professional instructors, full kit included, job placement support. Enroll now.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: SITE_URL },
			{
				name: "twitter:title",
				content: "Unicorn Barber Training Academy",
			},
			{
				name: "twitter:description",
				content:
					"Barbering & beauty training in Dhaka — working-professional instructors, full kit included, job placement support.",
			},
		],
		links: [
			{ rel: "canonical", href: SITE_URL },
			// LCP image preload: the mobile hero banner. `imagesrcset` lets
			// the browser pick the right variant before parsing the body.
			{
				rel: "preload",
				as: "image",
				imageSrcSet: `${banner480} 480w, ${banner640} 640w, ${banner768} 768w, ${banner896} 896w`,
				imageSizes: "100vw",
				// Mobile-only LCP candidate — desktop uses the photo column.
				media: "(max-width: 1023px)",
				fetchPriority: "high",
			},
			// Desktop LCP candidate: the hero photo column.
			{
				rel: "preload",
				as: "image",
				href: pic("unicorn-hero-barbering", 1400, 1700),
				media: "(min-width: 1024px)",
				fetchPriority: "high",
			},
		],
	}),
});
