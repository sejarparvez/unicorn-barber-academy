import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import {
	FinalCta,
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import { INSTRUCTORS, pic, SITE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: "About Us | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Unicorn Barber Training Academy — Dhaka's premier hands-on training academy for barbering and beauty & cosmetology. NTVQF certified, guild registered.",
			},
			{
				property: "og:title",
				content: "About Us | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Dhaka's premier hands-on training academy for barbering and beauty & cosmetology.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/about` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
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
			name: "About",
			item: `${SITE_URL}/about`,
		},
	],
};

const ORG_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "EducationalOrganization",
	name: "Unicorn Barber Training Academy",
	url: SITE_URL,
	logo: `${SITE_URL}/logo.png`,
	sameAs: [
		"https://instagram.com",
		"https://facebook.com",
		"https://youtube.com",
	],
	address: {
		"@type": "PostalAddress",
		streetAddress: "123 Fade Street",
		addressLocality: "Gulshan, Dhaka",
		postalCode: "1212",
		addressCountry: "BD",
	},
	contactPoint: {
		"@type": "ContactPoint",
		telephone: "+880-1234-567890",
		contactType: "admissions",
		availableLanguage: ["Bengali", "English"],
	},
};

function AboutPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
			/>
			<AboutHero />
			<OurStory />
			<OurApproach />
			<TheGuild />
			<FinalCta
				title="Want to see it for yourself?"
				accent="Book a studio visit."
				subtitle="Walk the floor, meet an instructor, and see a cohort in action. No pressure — just a proper look at what we do."
				ctaLabel="SCHEDULE A VISIT"
				ctaTo="/contact"
			/>
		</main>
	);
}

function AboutHero() {
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
			<div className="absolute inset-0 grid grid-cols-3">
				<img
					src={pic("unicorn-about-hero-1", 700, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-about-hero-2", 700, 1100)}
					alt=""
					className="hidden h-full w-full object-cover opacity-40 sm:block"
				/>
				<img
					src={pic("unicorn-about-hero-3", 700, 1100)}
					alt=""
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
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">ABOUT</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					The academy{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>
						behind the chair.
					</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Unicorn Barber Training Academy was founded on a simple premise: the
					best teachers are the ones still doing the work. Every instructor here
					cuts, colours, or styles for paying clients the same week they teach.
				</motion.p>
			</div>
		</section>
	);
}

function OurStory() {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="story-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Our Story" id="story-heading" />
				<div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
					<div>
						<p className="text-base leading-relaxed text-muted-foreground">
							Most training academies feel like classrooms. Ours feels like a
							shop — because it is one. Unicorn started when a group of working
							barbers and beauty professionals in Dhaka realised the gap between
							what schools taught and what the chair actually demanded.
						</p>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							We built the academy we wished existed when we were learning:
							small cohorts, real clients, instructors who still hustle behind
							the chair, and a curriculum that leads to an NTVQF-recognised
							certificate and a job, not just a piece of paper.
						</p>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							Today, we're a nationally registered training provider and a proud
							member of the Bangladesh Barbers & Beauticians Guild. Our
							graduates work in top salons and barbershops across Dhaka and
							beyond — many opening their own chairs within a year of
							graduating.
						</p>
					</div>
					<div className="relative aspect-[4/3] overflow-hidden">
						<img
							src={pic("unicorn-about-story", 800, 600)}
							alt="Unicorn Barber Training Academy studio floor with students at work"
							className="h-full w-full object-cover"
						/>
					</div>
				</div>
			</div>
		</section>
	);
}

function OurApproach() {
	const pillars = [
		{
			icon: "����",
			title: "Working Professionals Only",
			description:
				"No career academics. Every instructor earns their living cutting, colouring, or styling — then teaches what they did that week.",
		},
		{
			icon: "����",
			title: "Capped at 12",
			description:
				"Small cohorts mean more one-on-one time, more client rotations, and no hiding in the back row.",
		},
		{
			icon: "����",
			title: "Real Clients, Real Pressure",
			description:
				"Students work on paying clients from week three. You learn speed, consultation, and retail under actual shop conditions.",
		},
		{
			icon: "����",
			title: "NTVQF Certified",
			description:
				"Nationally recognised qualifications that employers trust and the guild endorses. Your certificate travels with you.",
		},
	];

	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="approach-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="2"
					title="How We're Different"
					id="approach-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{pillars.map((pillar, i) => (
						<Reveal key={pillar.title} delay={i * 0.08}>
							<div className="p-6 border border-border bg-background">
								<div className="text-3xl" aria-hidden="true">
									{pillar.icon}
								</div>
								<h3 className="mt-4 font-heading text-xl font-medium text-foreground">
									{pillar.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{pillar.description}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function TheGuild() {
	const credentials = [
		"Nationally Registered Training Provider (BTEB)",
		"NTVQF Certified Curriculum Levels 2–4",
		"Member, Bangladesh Barbers & Beauticians Guild",
		"Partner salons & barbershops across Dhaka",
	];

	return (
		<section
			className="border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="guild-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="3"
					title="Guild & Accreditation"
					id="guild-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{credentials.map((cred, i) => (
						<Reveal key={i} delay={i * 0.06}>
							<div className="p-6 border border-border bg-muted/30">
								<GuildSeal
									className="h-10 w-10 text-primary/60"
									aria-hidden="true"
								/>
								<p className="mt-3 text-sm leading-relaxed text-foreground">
									{cred}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
