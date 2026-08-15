import {
	IconArrowRight,
	IconBrandInstagram,
	IconBriefcase,
	IconClockHour4,
	IconMapPin,
	IconPhone,
	IconQuote,
	IconScissors,
	IconUsers,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Faq from "#/components/pages/home/faq";
import Hero from "#/components/pages/home/hero";
import Instructors from "#/components/pages/home/instructors";
import Programs from "#/components/pages/home/programs";
import Stats from "#/components/pages/home/stats";
import Testimonials from "#/components/pages/home/testimonials";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SITE_URL = "https://unicornbarbertrainingacademy.com";
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
			{ name: "twitter:card", content: "summary_large_image" },
		],
		links: [{ rel: "canonical", href: SITE_URL }],
	}),
});

const pic = (seed: string, w: number, h: number) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`;

function Home() {
	return (
		<>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-primary focus:bg-secondary focus:px-4 focus:py-2 focus:text-sm focus:text-secondary-foreground"
			>
				Skip to content
			</a>
			<main id="main-content">
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
		</>
	);
}

/* --------------------------- Why Unicorn --------------------------- */

const FEATURES = [
	{
		icon: IconScissors,
		title: "Taught by Working Professionals",
		description:
			"Every instructor still works a chair or a station. You learn what's current, not what's textbook.",
	},
	{
		icon: IconBriefcase,
		title: "Full Kit Included",
		description:
			"Clippers and shears, or a professional makeup and styling kit — yours from week one. No extra spend.",
	},
	{
		icon: IconUsers,
		title: "Job Placement Support",
		description:
			"Sixty partner salons and barbershops hire straight out of our cohorts.",
	},
	{
		icon: IconClockHour4,
		title: "Day & Evening Cohorts",
		description:
			"Train around a job or family. Same curriculum, same instructors, your schedule.",
	},
];

function SectionEyebrow({
	guard,
	title,
	id,
}: {
	guard: string;
	title: string;
	id: string;
}) {
	return (
		<div className="flex items-center gap-4">
			<span
				className="h-6 w-px bg-gradient-to-b from-[#F4C430] via-primary to-[#8B6914]"
				aria-hidden="true"
			/>
			<div>
				<p className="text-[11px] tracking-[0.28em] text-primary">
					GUARD &#8470; {guard}
				</p>
				<h2
					id={id}
					className="mt-1 text-3xl text-foreground sm:text-4xl"
					style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
				>
					{title}
				</h2>
			</div>
		</div>
	);
}

function WhyUnicorn() {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="why-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Why Unicorn" id="why-heading" />
				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature) => (
						<div
							key={feature.title}
							className="bg-background p-8 transition-colors hover:bg-accent"
						>
							<feature.icon
								className="h-7 w-7 text-primary"
								stroke={1.5}
								aria-hidden="true"
							/>
							<h3 className="mt-5 text-base font-semibold text-foreground">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

/* --------------------------- Student Life --------------------------- */

const GALLERY_ITEMS = [
	{
		seed: "unicorn-gallery-1",
		alt: "Barbering students practicing fades on mannequin heads",
	},
	{
		seed: "unicorn-gallery-2",
		alt: "Close-up of a professional makeup kit laid out for class",
	},
	{
		seed: "unicorn-gallery-3",
		alt: "Instructor demonstrating a straight-razor technique",
	},
	{
		seed: "unicorn-gallery-4",
		alt: "Beauty student styling hair during a practical session",
	},
	{
		seed: "unicorn-gallery-5",
		alt: "Graduating cohort posing together at the academy",
	},
	{
		seed: "unicorn-gallery-6",
		alt: "Row of barber chairs and styling stations in the training studio",
	},
];

function StudentLife() {
	return (
		<section
			className="border-t border-primary/15 bg-secondary px-6 py-24 text-secondary-foreground lg:px-10"
			aria-labelledby="academy-heading"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div className="flex items-center gap-4">
						<span
							className="h-6 w-px bg-gradient-to-b from-[#F4C430] via-primary to-[#8B6914]"
							aria-hidden="true"
						/>
						<div>
							<p className="text-[11px] tracking-[0.28em] text-primary">
								GUARD &#8470; 3
							</p>
							<h2
								id="academy-heading"
								className="mt-1 text-3xl sm:text-4xl"
								style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
							>
								Inside the Academy
							</h2>
						</div>
					</div>
					<Link
						to="/gallery"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-secondary-foreground/70 hover:text-primary"
					>
						SEE FULL GALLERY
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-6">
					{GALLERY_ITEMS.map((item, i) => (
						<div
							key={item.seed}
							className={cn(
								"group relative overflow-hidden",
								i === 0 || i === 3 ? "col-span-2 row-span-2" : "col-span-1",
							)}
						>
							<img
								src={pic(item.seed, 700, 700)}
								alt={item.alt}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
						</div>
					))}
				</div>
			</div>
		</section>
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
				className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-[0.03]"
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
					<span className="bg-gradient-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent">
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
