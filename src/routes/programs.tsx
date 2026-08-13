import {
	IconArrowRight,
	IconCertificate,
	IconChecks,
	IconClipboardList,
	IconMoonStars,
	IconSchool,
	IconScissors,
	IconSparkles,
	IconSun,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import {
	FinalCta,
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import {
	ALL_PROGRAMS,
	type Program,
	pic,
	SITE_URL,
	type Track,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/programs")({
	component: ProgramsPage,
	head: () => ({
		meta: [
			{ title: "Programs | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Six hands-on barbering and beauty & cosmetology programs in Dhaka — from 4-week specialisations to full 16-week certifications. Day and evening cohorts available.",
			},
			{
				property: "og:title",
				content: "Programs | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Six hands-on barbering and beauty & cosmetology programs, taught by working professionals in Dhaka.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/programs` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/programs` }],
	}),
});

const BREADCRUMB_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Programs",
			item: `${SITE_URL}/programs`,
		},
	],
};

function ProgramsPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<ProgramsHero />
			<ProgramCatalogue />
			<HowItWorks />
			<CohortFormat />
			<FinalCta
				title="Six programs. Two crafts."
				accent="One seat left in each cohort size."
				subtitle="Apply now — cohorts are kept small on purpose, and the Fall intake fills from this page first."
			/>
		</main>
	);
}

/* ----------------------------- Hero ----------------------------- */
/* Shorter than the homepage hero (this is a listing page, not the
   thesis statement) but built on the same vignette + seal language
   so it reads as the same site, not a different one. */

function ProgramsHero() {
	const shouldReduceMotion = useReducedMotion();
	const fadeUp = (delay = 0) =>
		shouldReduceMotion
			? {}
			: {
					initial: { opacity: 0, y: 18 },
					animate: { opacity: 1, y: 0 },
					transition: {
						duration: 0.7,
						delay,
						ease: [0.16, 1, 0.3, 1] as const,
					},
				};

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-2">
				<img
					src={pic("unicorn-programs-hero-1", 900, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-programs-hero-2", 900, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
			</div>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(60% 65% at 50% 42%, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.8) 45%, rgba(8,8,8,0.55) 78%, rgba(8,8,8,0.34) 100%)",
				}}
			/>
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">PROGRAMS</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					Find your{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>craft.</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Six programs across barbering and beauty & cosmetology — from 4-week
					specialisations to full certifications. Every one taught by someone
					who still works a chair or a station.
				</motion.p>

				<motion.div
					{...fadeUp(0.26)}
					className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] tracking-[0.18em] text-secondary-foreground/55"
				>
					<span>{ALL_PROGRAMS.length} PROGRAMS</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>4&ndash;16 WEEKS</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>DAY &amp; EVENING COHORTS</span>
				</motion.div>
			</div>
		</section>
	);
}

/* ------------------------- Program catalogue ------------------------- */

const FILTERS: { key: "all" | Track; label: string }[] = [
	{ key: "all", label: "All Programs" },
	{ key: "barbering", label: "Barbering" },
	{ key: "beauty", label: "Beauty & Cosmetology" },
];

function ProgramCatalogue() {
	const [active, setActive] = useState<"all" | Track>("all");
	const shouldReduceMotion = useReducedMotion();

	const visible = useMemo(
		() =>
			active === "all"
				? ALL_PROGRAMS
				: ALL_PROGRAMS.filter((p) => p.track === active),
		[active],
	);

	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="catalogue-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="1"
					title="The Catalogue"
					id="catalogue-heading"
				/>

				<div
					role="tablist"
					aria-label="Filter programs by track"
					className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-border"
				>
					{FILTERS.map((f) => (
						<button
							key={f.key}
							type="button"
							role="tab"
							aria-selected={active === f.key}
							onClick={() => setActive(f.key)}
							className={cn(
								"relative pb-4 text-[13px] font-medium tracking-[0.1em] transition-colors",
								active === f.key
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{f.label.toUpperCase()}
							{active === f.key && (
								<motion.span
									layoutId="programs-tab-underline"
									className="absolute inset-x-0 -bottom-px h-[2px] bg-primary"
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: { type: "spring", stiffness: 380, damping: 32 }
									}
								/>
							)}
						</button>
					))}
				</div>

				<motion.div
					layout
					className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
				>
					<AnimatePresence mode="popLayout">
						{visible.map((program, i) => (
							<motion.div
								key={program.title}
								layout
								initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
								transition={{
									duration: 0.35,
									delay: shouldReduceMotion ? 0 : i * 0.04,
									ease: [0.16, 1, 0.3, 1],
								}}
							>
								<ProgramListingCard program={program} />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>

				{visible.length === 0 && (
					<p className="mt-10 text-sm text-muted-foreground">
						No programs in this track yet — check back soon.
					</p>
				)}
			</div>
		</section>
	);
}

function ProgramListingCard({ program }: { program: Program }) {
	const trackLabel =
		program.track === "barbering" ? "Barbering" : "Beauty & Cosmetology";
	return (
		<Link
			to={program.to}
			className="group flex h-full flex-col overflow-hidden border border-border transition-colors hover:border-primary/40"
		>
			<div className="relative aspect-[4/3] overflow-hidden">
				<img
					src={program.image}
					alt={program.alt}
					loading="lazy"
					className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
				<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
					{trackLabel.toUpperCase()}
				</span>
			</div>
			<div className="flex flex-1 flex-col p-6">
				<div className="flex items-center gap-3 text-[11px] tracking-[0.14em] text-muted-foreground">
					<span>{program.duration.toUpperCase()}</span>
					<span className="h-1 w-1 rounded-full bg-primary/40" />
					<span>{program.level.toUpperCase()}</span>
				</div>
				<h3 className="mt-3 font-heading text-xl font-medium text-foreground group-hover:text-primary">
					{program.title}
				</h3>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					{program.description}
				</p>
				<ul className="mt-4 flex flex-wrap gap-2">
					{program.highlights.map((h) => (
						<li
							key={h}
							className="border border-border px-2.5 py-1 text-[10px] tracking-[0.06em] text-muted-foreground"
						>
							{h}
						</li>
					))}
				</ul>
				<span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.1em] text-primary">
					VIEW CURRICULUM
					<IconArrowRight
						className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
						stroke={1.75}
					/>
				</span>
			</div>
		</Link>
	);
}

/* ----------------------------- How it works ----------------------------- */
/* This IS a real sequence — you enroll, then train, then practice in
   the studio, then certify — so numbered steps are earned here, unlike
   the GUARD markers elsewhere which are a section motif, not an order. */

const STEPS = [
	{
		no: "01",
		icon: IconClipboardList,
		title: "Apply & Enroll",
		description:
			"Pick a track, choose day or evening, and reserve your seat with a short application.",
	},
	{
		no: "02",
		icon: IconSchool,
		title: "Learn the Fundamentals",
		description:
			"Weeks of guided instruction on technique, sanitation, and client consultation before you touch a live client.",
	},
	{
		no: "03",
		icon: IconScissors,
		title: "Studio Practice",
		description:
			"Work real clients under instructor supervision in the training studio, building your portfolio as you go.",
	},
	{
		no: "04",
		icon: IconCertificate,
		title: "Certify & Get Placed",
		description:
			"Graduate with an NTVQF-recognised certificate and an introduction to our partner salons and barbershops.",
	},
];

function HowItWorks() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="how-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="2" title="How Training Works" id="how-heading" />
				<div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
					<div
						aria-hidden="true"
						className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block"
					/>
					{STEPS.map((step, i) => (
						<Reveal key={step.no} delay={i * 0.08} className="relative">
							<div className="relative flex h-12 w-12 items-center justify-center border border-primary/40 bg-background">
								<step.icon className="h-5 w-5 text-primary" stroke={1.5} />
							</div>
							<span
								className={cn(
									"absolute right-0 top-0 font-heading text-4xl font-medium opacity-20",
									GOLD_TEXT,
								)}
								aria-hidden="true"
							>
								{step.no}
							</span>
							<h3 className="mt-5 text-base font-semibold text-foreground">
								{step.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{step.description}
							</p>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Cohort format ----------------------------- */

function CohortFormat() {
	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="cohort-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="3" title="Day or Evening" id="cohort-heading" />
				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border lg:grid-cols-2">
					<Reveal className="bg-background p-10">
						<IconSun
							className="h-7 w-7 text-primary"
							stroke={1.5}
							aria-hidden="true"
						/>
						<h3 className="mt-5 font-heading text-2xl font-medium text-foreground">
							Day Cohort
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							9:00 AM &ndash; 2:00 PM, Sunday&ndash;Thursday
						</p>
						<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
							Best for students training full-time, with the most studio hours
							per week and first access to visiting-artist workshops.
						</p>
						<ul className="mt-5 space-y-2 text-sm text-foreground">
							{[
								"Fastest path to certification",
								"Priority studio hours",
								"Full-time client rotation",
							].map((item) => (
								<li key={item} className="flex items-center gap-2">
									<IconChecks
										className="h-4 w-4 shrink-0 text-primary"
										stroke={1.75}
									/>
									{item}
								</li>
							))}
						</ul>
					</Reveal>
					<Reveal delay={0.08} className="bg-background p-10">
						<IconMoonStars
							className="h-7 w-7 text-primary"
							stroke={1.5}
							aria-hidden="true"
						/>
						<h3 className="mt-5 font-heading text-2xl font-medium text-foreground">
							Evening Cohort
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							6:00 PM &ndash; 9:30 PM, Sunday&ndash;Thursday
						</p>
						<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
							Same curriculum, same instructors — built for students training
							around a job or family commitments.
						</p>
						<ul className="mt-5 space-y-2 text-sm text-foreground">
							{[
								"Same certification, same instructors",
								"Small cohort sizes",
								"Weekend studio access included",
							].map((item) => (
								<li key={item} className="flex items-center gap-2">
									<IconChecks
										className="h-4 w-4 shrink-0 text-primary"
										stroke={1.75}
									/>
									{item}
								</li>
							))}
						</ul>
					</Reveal>
				</div>
				<p className="mt-6 flex items-center gap-2 text-[12px] tracking-[0.08em] text-muted-foreground">
					<IconSparkles className="h-3.5 w-3.5 text-primary" stroke={1.75} />
					Every program runs on both schedules — pick the track first, the
					cohort second.
				</p>
			</div>
		</section>
	);
}
