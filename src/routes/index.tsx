import { IconClockHour4, IconMapPin, IconPhone } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { FinalCta, SectionEyebrow } from "@/components/effects";
import { buttonVariants } from "@/components/ui/button";
import { AREAS_SERVED, CONTACT, SITE_URL } from "@/data/site";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
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
					"Hands-on barbering and beauty & cosmetology training in Dhaka. Working-professional instructors, full kit included, job placement support. Enrollment open for the Fall cohort.",
			},
			{ property: "og:title", content: "Unicorn Barber Training Academy" },
			{
				property: "og:description",
				content:
					"Hands-on barbering and beauty & cosmetology training taught by working professionals. Enrollment open for the Fall cohort.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: SITE_URL },
		],
		links: [{ rel: "canonical", href: SITE_URL }],
	}),
});

function Home() {
	return (
		<main>
			<Hero />
			<CraftMarquee />
			<WhyUnicorn />
			<Brand />
			<Stats />
			<Programs />
			<StudentLife />
			<Instructors />
			<Testimonials />
			<Faq />
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
	return (
		<section
			className="border-t border-primary/15"
			aria-labelledby="visit-heading"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="flex flex-col justify-center px-4 py-24 lg:px-10">
					<SectionEyebrow
						guard="7"
						title="Visit the Academy"
						id="visit-heading"
					/>
					<address className="mt-8 space-y-5 text-sm not-italic text-secondary-foreground/75">
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>{CONTACT.addressDisplay}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconPhone
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<a href={CONTACT.phoneHref} className="hover:text-primary">
								{CONTACT.phoneDisplay}
							</a>
						</p>
						<p className="flex items-start gap-3">
							<IconClockHour4
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>{CONTACT.hoursSummary}</span>
						</p>
						<p className="flex items-start gap-3">
							<IconMapPin
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>
								Convenient for students from{" "}
								{AREAS_SERVED.slice(0, 5).join(", ")} and across Dhaka.
							</span>
						</p>
					</address>
					<a
						href={CONTACT.mapsUrl}
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
						src={CONTACT.mapsEmbedUrl}
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
