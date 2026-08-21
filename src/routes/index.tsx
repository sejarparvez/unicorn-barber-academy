import { IconClockHour4, IconMapPin, IconPhone } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Faq from "@/components/pages/home/faq";
import Hero from "@/components/pages/home/hero";
import Instructors from "@/components/pages/home/instructors";
import Programs from "@/components/pages/home/programs";
import Stats from "@/components/pages/home/stats";
import StudentLife from "@/components/pages/home/student-life";
import Testimonials from "@/components/pages/home/testimonials";
import WhyUnicorn from "@/components/pages/home/why-us";
import { FinalCta, SectionEyebrow } from "@/components/site/decor";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT, pic, SITE_URL } from "@/lib/site-data";
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
			<WhyUnicorn />
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
			className="border-t border-primary/15 bg-secondary text-secondary-foreground"
			aria-labelledby="visit-heading"
		>
			<div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
				<div className="flex flex-col justify-center px-6 py-24 lg:px-10">
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
					</address>
					<Link
						to="/contact"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"mt-9 w-fit rounded-none border-primary bg-transparent px-6 py-5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
						)}
					>
						GET DIRECTIONS
					</Link>
				</div>
				<div className="relative h-72 lg:h-auto">
					<Image
						src={pic("unicorn-location-map", 1000, 900)}
						alt="Street map showing the location of Unicorn Barber Training Academy in Gulshan, Dhaka"
						layout="fullWidth"
						className="h-full w-full object-cover opacity-70"
					/>
					<div className="absolute inset-0 bg-secondary/30" />
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Final CTA -----------------------------
   Shared FinalCta from @/components/site/decor — see top of file. */
