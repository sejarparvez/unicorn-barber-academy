import { IconClockHour4, IconMapPin, IconPhone } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import banner480 from "@/assets/logo/banner-480.webp";
import banner640 from "@/assets/logo/banner-640.webp";
import banner768 from "@/assets/logo/banner-768.webp";
import banner896 from "@/assets/logo/banner-896.webp";
import { FinalCta, SectionEyebrow } from "@/components/effects";
import { CardGridSkeleton } from "@/components/route-skeletons";
import { buttonVariants } from "@/components/ui/button";
import { SITE_URL } from "@/data/site";
import Brand from "@/features/home/sections/brand";
import CraftMarquee from "@/features/home/sections/craft-marquee";
import Faq from "@/features/home/sections/faq";
import Hero from "@/features/home/sections/hero";
import Instructors from "@/features/home/sections/instructors";
import Programs from "@/features/home/sections/programs";
import Stats from "@/features/home/sections/stats";
import StudentLife from "@/features/home/sections/student-life";
import Testimonials from "@/features/home/sections/testimonials";
import WhyUnicorn from "@/features/home/sections/why-us";
import { useSite } from "@/lib/site-context";
import { cn } from "@/lib/utils";
import {
	useFeaturedGallery,
	useHomeFaqs,
	useHomeInstructors,
	useHomeTestimonials,
} from "@/service/content";

export const Route = createFileRoute("/")({
	// No route loader on purpose: the hero (and LCP image) is fully static,
	// so Home renders and streams immediately while the DB-backed sections
	// below resolve independently behind Suspense. A loader would hold the
	// entire page — LCP included — on four content queries.
	component: Home,
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
		],
	}),
});

function StudentLifeSection() {
	const { data: featured } = useFeaturedGallery();
	return <StudentLife items={featured} />;
}

function InstructorsSection() {
	const { data: instructors } = useHomeInstructors();
	return <Instructors instructors={instructors} />;
}

function TestimonialsSection() {
	const { data: testimonials } = useHomeTestimonials();
	return <Testimonials items={testimonials} />;
}

function FaqSection() {
	const { data: faqs } = useHomeFaqs();
	return <Faq items={faqs} />;
}

function Home() {
	return (
		<main>
			<Hero />
			<CraftMarquee />
			<WhyUnicorn />
			<Brand />
			<Stats />
			<Programs />
			<Suspense fallback={<CardGridSkeleton count={4} />}>
				<StudentLifeSection />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={4} />}>
				<InstructorsSection />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={3} />}>
				<TestimonialsSection />
			</Suspense>
			<Suspense fallback={<CardGridSkeleton count={4} />}>
				<FaqSection />
			</Suspense>
			<VisitUs />
			<FinalCta
				title="Your chair — or your studio —"
				accent="is waiting."
				subtitle="The Fall cohort starts soon and seats are limited to keep instructor time one-on-one. Apply now to hold your spot."
			/>
		</main>
	);
}

/* ----------------------------- Visit Us ----------------------------- */

function VisitUs() {
	const { contact, areasServed } = useSite();
	return (
		<section
			className="border-t border-primary/15"
			aria-labelledby="visit-heading"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="flex flex-col justify-center px-4 py-24 lg:px-10">
					<SectionEyebrow title="Visit the Academy" id="visit-heading" />
					<address className="mt-8 space-y-5 text-sm not-italic text-secondary-foreground/75">
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>{contact.addressDisplay}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconPhone
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<a href={contact.phoneHref} className="hover:text-primary">
								{contact.phoneDisplay}
							</a>
						</p>
						<p className="flex items-start gap-3">
							<IconClockHour4
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>{contact.hoursSummary}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>
								Convenient for students from{" "}
								{areasServed.slice(0, 5).join(", ")} and across Dhaka.
							</span>
						</p>
					</address>
					<a
						href={contact.mapsUrl}
						target="_blank"
						rel="noreferrer"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"mt-9 w-fit rounded-none border-primary bg-transparent px-6 py-5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
						)}
					>
						GET DIRECTIONS
					</a>
				</div>
				<div className="relative h-72 lg:h-auto">
					<iframe
						title="Google Map showing the location of Unicorn Barber Training Academy in Banasree, Rampura, Dhaka"
						src={contact.mapsEmbedUrl}
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
						className="h-full min-h-[18rem] w-full border-0 opacity-90"
					/>
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Final CTA -----------------------------
   Shared FinalCta from @/components/effects — see top of file. */
