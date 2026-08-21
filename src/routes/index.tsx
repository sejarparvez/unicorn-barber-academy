import { IconClockHour4, IconMapPin, IconPhone } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Faq from "#/components/pages/home/faq";
import Hero from "#/components/pages/home/hero";
import Instructors from "#/components/pages/home/instructors";
import Programs from "#/components/pages/home/programs";
import Stats from "#/components/pages/home/stats";
import StudentLife from "#/components/pages/home/student-life";
import Testimonials from "#/components/pages/home/testimonials";
import WhyUnicorn from "#/components/pages/home/why-us";
import { SectionEyebrow } from "#/components/site/decor";
import { buttonVariants } from "@/components/ui/button";
import { SITE_URL } from "@/lib/site-data";
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

const pic = (seed: string, w: number, h: number) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`;

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
			<FinalCta />
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
							<span>123 Fade Street, Gulshan, Dhaka 1212, Bangladesh</span>
						</p>
						<p className="flex items-start gap-3">
							<IconPhone
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<a href="tel:+8801234567890" className="hover:text-primary">
								+880 1234-567890
							</a>
						</p>
						<p className="flex items-start gap-3">
							<IconClockHour4
								className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
								stroke={1.75}
							/>
							<span>Monday&ndash;Saturday, 9AM&ndash;7PM</span>
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
					<img
						src={pic("unicorn-location-map", 1000, 900)}
						alt="Street map showing the location of Unicorn Barber Training Academy in Gulshan, Dhaka"
						className="h-full w-full object-cover opacity-70"
					/>
					<div className="absolute inset-0 bg-secondary/30" />
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Final CTA ----------------------------- */

function FinalCta() {
	return (
		<section className="relative overflow-hidden border-t border-primary/15 bg-secondary px-6 py-28 text-center text-secondary-foreground lg:px-10">
			<svg
				viewBox="0 0 400 400"
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
			>
				<path
					d="M200 40 L240 190 L200 360 L160 190 Z"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="3"
				/>
				<circle
					cx="200"
					cy="200"
					r="180"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="2"
				/>
			</svg>
			<div className="relative mx-auto max-w-2xl">
				<h2
					className="text-4xl sm:text-5xl"
					style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
				>
					Your chair &mdash; or your studio &mdash;{" "}
					<span className="bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent">
						is waiting.
					</span>
				</h2>
				<p className="mt-5 text-base leading-relaxed text-secondary-foreground/65">
					The Fall cohort starts soon and seats are limited to keep instructor
					time one-on-one. Apply now to hold your spot.
				</p>
				<div className="mt-10 flex justify-center">
					<Link
						to="/enroll"
						className={cn(
							buttonVariants(),
							"rounded-none bg-primary px-8 py-6 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground hover:bg-primary/90",
						)}
					>
						ENROLL NOW
					</Link>
				</div>
			</div>
		</section>
	);
}
