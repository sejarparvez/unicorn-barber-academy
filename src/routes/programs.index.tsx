// routes/programs.tsx
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
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import { ProgramCard } from "@/components/site/program-card";

import { ALL_PROGRAMS, SITE_URL, type Track } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/programs/")({
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
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
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
/* Not the Contact-page vignette-and-seal template — this is a listing
   page, so its job is navigation. The right column is a literal
   ledger index of every program, continuing the record-keeping
   language from the homepage's trade ticket and instructors' member
   numbers, instead of a photographic pitch. */

function ProgramsHero() {
	const totalWeeks = ALL_PROGRAMS.map((p) => Number.parseInt(p.duration, 10));
	const min = Math.min(...totalWeeks);
	const max = Math.max(...totalWeeks);

	return (
		<section className="border-b border-border bg-background px-6 pt-28 pb-16 lg:px-10 lg:pt-36 lg:pb-20">
			<div className="mx-auto max-w-7xl">
				<div className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-muted-foreground">
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">PROGRAMS</span>
				</div>

				<div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-start">
					{/* Left: statement */}
					<div>
						<SectionEyebrow
							id="program"
							guard="1"
							title="The Catalogue"
							as="p"
						/>
						<h1 className="mt-6 font-heading text-5xl font-medium leading-[1.08] sm:text-6xl">
							Every program,{" "}
							<span className={cn("italic font-normal", GOLD_TEXT)}>
								on the record.
							</span>
						</h1>
						<p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
							Six programs across barbering and beauty & cosmetology, taught by
							people who still work a chair or a station. Full curriculum, kit,
							and outcomes on every listing — no guessing what you're signing up
							for.
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] tracking-[0.14em] text-muted-foreground">
							<span>{ALL_PROGRAMS.length} PROGRAMS</span>
							<span className="h-1 w-1 rounded-full bg-primary/50" />
							<span>
								{min}&ndash;{max} WEEKS
							</span>
							<span className="h-1 w-1 rounded-full bg-primary/50" />
							<span>DAY &amp; EVENING COHORTS</span>
						</div>

						<div className="mt-9 flex flex-wrap gap-4">
							<Link
								to="/enroll"
								className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
							>
								APPLY NOW
							</Link>
							<Link
								to="."
								hash="catalogue-heading"
								className="inline-flex items-center gap-2 border border-border px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary"
							>
								BROWSE THE CATALOGUE
								<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
							</Link>
						</div>
					</div>

					{/* Right: the ledger — a real index, not decoration */}
					<div className="border border-border">
						<p className="border-b border-border bg-muted/40 px-5 py-3 text-[10px] tracking-[0.24em] text-muted-foreground">
							PROGRAM INDEX
						</p>
						<ol>
							{ALL_PROGRAMS.map((program, i) => (
								<li
									key={program.slug}
									className="border-b border-border last:border-b-0"
								>
									<Link
										to={program.to}
										className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
									>
										<span
											className="w-6 shrink-0 font-heading text-sm text-primary"
											aria-hidden="true"
										>
											{String(i + 1).padStart(2, "0")}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
												{program.title}
											</span>
											<span className="block text-[11px] tracking-[0.06em] text-muted-foreground">
												{program.duration.toUpperCase()} &middot;{" "}
												{program.level.toUpperCase()}
											</span>
										</span>
										<IconArrowRight
											className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary"
											stroke={1.75}
										/>
									</Link>
								</li>
							))}
						</ol>
					</div>
				</div>
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
					guard="2"
					title="Browse by Track"
					id="catalogue-heading"
				/>

				<fieldset className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-border p-0 m-0">
					<legend className="sr-only">Filter programs by track</legend>
					{FILTERS.map((f) => (
						<button
							key={f.key}
							type="button"
							aria-pressed={active === f.key}
							onClick={() => setActive(f.key)}
							className={cn(
								"relative pb-4 text-[13px] font-medium tracking-widest transition-colors",
								active === f.key
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{f.label.toUpperCase()}
							{active === f.key && (
								<motion.span
									layoutId="programs-tab-underline"
									className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: { type: "spring", stiffness: 380, damping: 32 }
									}
								/>
							)}
						</button>
					))}
				</fieldset>

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
								<ProgramCard program={program} />
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

/* ----------------------------- How it works ----------------------------- */

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
				<SectionEyebrow guard="3" title="How Training Works" id="how-heading" />
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
				<SectionEyebrow guard="4" title="Day or Evening" id="cohort-heading" />
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
