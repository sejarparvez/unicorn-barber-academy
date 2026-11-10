import { lazy, Suspense } from "react";
import { FinalCta } from "@/components/effects";
import {
	HomeFaqSkeleton,
	HomeGallerySkeleton,
	HomeInstructorsSkeleton,
	HomeTestimonialsSkeleton,
} from "@/components/route-skeletons";
import {
	useFeaturedGallery,
	useHomeFaqs,
	useHomeInstructors,
	useHomeTestimonials,
} from "@/service/content";
import Brand from "./brand";
import CraftMarquee from "./craft-marquee";
import Faq from "./faq";
import Hero from "./hero";
import Instructors from "./instructors";
import Programs from "./programs";
import Stats from "./stats";
import StudentLife from "./student-life";
import VisitUs from "./visit-us";
import WhyUnicorn from "./why-us";

// Testimonials pulls in embla-carousel (~30 KB) but sits far below the fold:
// split it into its own chunk so it neither downloads nor evaluates before
// LCP. Crawlers render JS, so the content stays indexed.
const Testimonials = lazy(() => import("./testimonials"));

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

export default function HomePage() {
	return (
		<main>
			<Hero />
			<CraftMarquee />
			<WhyUnicorn />
			<Brand />
			<Stats />
			<Programs />
			<Suspense fallback={<HomeGallerySkeleton />}>
				<StudentLifeSection />
			</Suspense>
			<Suspense fallback={<HomeInstructorsSkeleton />}>
				<InstructorsSection />
			</Suspense>
			<Suspense fallback={<HomeTestimonialsSkeleton />}>
				<TestimonialsSection />
			</Suspense>
			<Suspense fallback={<HomeFaqSkeleton />}>
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
