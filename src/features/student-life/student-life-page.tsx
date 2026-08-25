// src/features/student-life/student-life-page.tsx
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import {
	FinalCta,
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
	useFadeUp,
} from "@/components/effects";
import { GALLERY_ITEMS } from "@/data/gallery";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";
import { stringifyJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

const BREADCRUMB_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Student Life",
			item: `${SITE_URL}/student-life`,
		},
	],
};

const STUDIO_ITEMS = GALLERY_ITEMS.filter((g) => g.category === "studio");
const GRAD_ITEMS = GALLERY_ITEMS.filter((g) => g.category === "graduation");

export function StudentLifePage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(BREADCRUMB_JSON_LD),
				}}
			/>
			<StudentLifeHero />
			<StudioFloor />
			<CohortLife />
			<GraduationDays />
			<FinalCta
				title="Your cohort is waiting."
				accent="Apply to join them."
				subtitle="Every graduation photo started with an application form. The next cohort forms soon — limited seats available."
			/>
		</main>
	);
}

function StudentLifeHero() {
	const fadeUp = useFadeUp();

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-3">
				<Image
					src={pic("unicorn-student-hero-1", 700, 1100)}
					alt=""
					layout="fullWidth"
					fetchPriority="high"
					loading="eager"
					className="h-full w-full object-cover opacity-40"
				/>
				<Image
					src={pic("unicorn-student-hero-2", 700, 1100)}
					alt=""
					layout="fullWidth"
					className="hidden h-full w-full object-cover opacity-40 sm:block"
				/>
				<Image
					src={pic("unicorn-student-hero-3", 700, 1100)}
					alt=""
					layout="fullWidth"
					className="hidden h-full w-full object-cover opacity-40 lg:block"
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
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">STUDENT LIFE</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					Where the craft{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>
						comes alive.
					</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Training at Unicorn isn't just coursework — it's late-night technique
					debates, first-client nerves, cohort inside jokes, and the quiet pride
					of holding your certificate at the end.
				</motion.p>
			</div>
		</section>
	);
}

function StudioFloor() {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="studio-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="1"
					title="The Studio Floor"
					id="studio-heading"
				/>
				<p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
					Twelve chairs. Two wash basins. A colour bar. A retail wall. This is
					where you'll spend 80% of your time — not in a lecture hall.
				</p>
				<div className="mt-14 columns-2 gap-4 sm:columns-3 lg:columns-4">
					{STUDIO_ITEMS.map((item, i) => (
						<Reveal
							key={item.id}
							delay={(i % 8) * 0.04}
							className="mb-4 break-inside-avoid"
						>
							<Image
								src={pic(item.seed, item.w, item.h)}
								alt={item.alt}
								width={item.w}
								height={item.h}
								loading="lazy"
								className="h-auto w-full rounded-none border border-border object-cover"
							/>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function CohortLife() {
	const moments = [
		{
			title: "Morning Briefing",
			description:
				"Every day starts with a 15-minute huddle — schedule review, product focus, and the day's technical objective.",
		},
		{
			title: "Live Client Rotations",
			description:
				"From week three, you're on the floor. Real clients, real consultations, real retail — supervised by your instructor.",
		},
		{
			title: "Peer Learning",
			description:
				"Cohorts of 12 mean you learn from each other's clients, mistakes, and breakthroughs. The group chat stays active long after graduation.",
		},
		{
			title: "Visiting Artists",
			description:
				"Monthly workshops with guest barbers, colourists, and makeup artists — techniques you won't find in the curriculum.",
		},
	];

	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="cohort-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="2"
					title="A Day in the Life"
					id="cohort-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{moments.map((moment, i) => (
						<Reveal key={moment.title} delay={i * 0.08}>
							<div className="p-6 border border-border bg-background">
								<h3 className="font-heading text-lg font-medium text-foreground">
									{moment.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{moment.description}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function GraduationDays() {
	return (
		<section
			className="section-light border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="grad-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="3" title="Graduation Days" id="grad-heading" />
				<p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
					The ceremony is simple: certificates, a guild pin, a group photo, and
					the quiet realisation that you're now the professional.
				</p>
				<div className="mt-14 columns-2 gap-4 sm:columns-3 lg:columns-4">
					{GRAD_ITEMS.map((item, i) => (
						<Reveal
							key={item.id}
							delay={(i % 8) * 0.04}
							className="mb-4 break-inside-avoid"
						>
							<Image
								src={pic(item.seed, item.w, item.h)}
								alt={item.alt}
								width={item.w}
								height={item.h}
								loading="lazy"
								className="h-auto w-full rounded-none border border-border object-cover"
							/>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
