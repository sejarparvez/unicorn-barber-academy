// src/features/careers/careers-page.tsx
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
import { pic } from "@/data/images";
import { CONTACT, SITE_URL } from "@/data/site";
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
			name: "Careers",
			item: `${SITE_URL}/careers`,
		},
	],
};

/** Keep in sync with the visible roles in <OpenRoles /> below. */
const OPEN_ROLES = [
	{
		title: "Instructor, Barbering",
		type: "Part-time / Cohort-based",
		description:
			"Teach Classic Barbering, Fades & Tapers, or Beard Sculpting. Two cohorts per year (day & evening). You design your block, we handle the rest.",
		requirements: [
			"5+ years behind the chair",
			"Current portfolio & client base",
			"NTVQF certification (or willingness to obtain)",
			"Guild membership preferred",
		],
	},
	{
		title: "Instructor, Beauty & Cosmetology",
		type: "Part-time / Cohort-based",
		description:
			"Teach Cosmetology Fundamentals, Hair Styling & Colouring, or Bridal & Editorial Makeup. Same model: you teach what you practice.",
		requirements: [
			"5+ years professional experience",
			"Current portfolio & client base",
			"NTVQF certification (or willingness to obtain)",
			"Guild membership preferred",
		],
	},
	{
		title: "Studio Coordinator",
		type: "Full-time",
		description:
			"Run the floor: client scheduling, inventory, tool maintenance, cohort logistics. The engine that keeps the studio humming.",
		requirements: [
			"2+ years salon/barbershop operations",
			"Booking software fluency (Vagaro, Booksy, etc.)",
			"Retail & inventory management",
			"Bilingual (Bengali/English)",
		],
	},
] as const;

function jobPostingsJsonLd() {
	return {
		"@context": "https://schema.org",
		"@graph": OPEN_ROLES.map((role) => ({
			"@type": "JobPosting",
			title: role.title,
			description: `${role.description} Requirements: ${role.requirements.join("; ")}.`,
			employmentType: role.type.startsWith("Full-time")
				? "FULL_TIME"
				: "PART_TIME",
			datePosted: "2026-01-01",
			validThrough: "2026-12-31",
			hiringOrganization: {
				"@type": ["EducationalOrganization", "LocalBusiness"],
				name: "Unicorn Barber Training Academy",
				sameAs: SITE_URL,
				logo: `${SITE_URL}/logo.png`,
				address: {
					"@type": "PostalAddress",
					streetAddress: CONTACT.streetAddress,
					addressLocality: "Dhaka",
					addressRegion: "Dhaka",
					postalCode: CONTACT.postalCode,
					addressCountry: CONTACT.addressCountry,
				},
			},
			jobLocation: {
				"@type": "Place",
				address: {
					"@type": "PostalAddress",
					streetAddress: CONTACT.streetAddress,
					addressLocality: "Dhaka",
					addressRegion: "Dhaka",
					postalCode: CONTACT.postalCode,
					addressCountry: CONTACT.addressCountry,
				},
			},
			applicantLocationRequirements: {
				"@type": "Country",
				name: "Bangladesh",
			},
			directApply: false,
			howToApply: {
				"@type": "HowToApply",
				url: `${SITE_URL}/contact`,
			},
		})),
	};
}

export function CareersPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(BREADCRUMB_JSON_LD),
				}}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(jobPostingsJsonLd()),
				}}
			/>
			<CareersHero />
			<OpenRoles />
			<WhyTeach />
			<FinalCta
				title="Think you'd fit?"
				accent="Start a conversation."
				subtitle="We take on one or two working professionals a year. No teaching experience required — just a chair you're proud of and a desire to pass it on."
				ctaLabel="INQUIRE ABOUT OPENINGS"
				ctaTo="/contact"
			/>
		</main>
	);
}

function CareersHero() {
	const fadeUp = useFadeUp();

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-2">
				<Image
					src={pic("unicorn-careers-hero-1", 900, 1100)}
					alt=""
					layout="fullWidth"
					fetchPriority="high"
					loading="eager"
					className="h-full w-full object-cover opacity-40"
				/>
				<Image
					src={pic("unicorn-careers-hero-2", 900, 1100)}
					alt=""
					layout="fullWidth"
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
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">CAREERS</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					Teach the craft{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>you live.</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					We don't hire career academics. We hire barbers, colourists, and
					makeup artists who still love the chair — and want to shape the next
					generation.
				</motion.p>
			</div>
		</section>
	);
}

function OpenRoles() {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="roles-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Open Roles" id="roles-heading" />
				<div className="mt-14 space-y-12">
					{OPEN_ROLES.map((role, i) => (
						<Reveal key={role.title} delay={i * 0.08}>
							<div className="border border-border bg-background p-8 lg:p-12">
								<div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
									<div>
										<h3 className="font-heading text-2xl font-medium text-foreground">
											{role.title}
										</h3>
										<p className="mt-1 text-sm text-primary">{role.type}</p>
										<p className="mt-4 text-base leading-relaxed text-muted-foreground">
											{role.description}
										</p>
									</div>
									<ul className="flex flex-col gap-2 min-w-50">
										{role.requirements.map((req) => (
											<li
												key={req}
												className="flex items-center gap-2 text-sm text-foreground"
											>
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
												{req}
											</li>
										))}
									</ul>
								</div>
								<div className="mt-8 pt-8 border-t border-border">
									<Link
										to="/contact"
										className="inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
									>
										EXPRESS INTEREST
									</Link>
								</div>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function WhyTeach() {
	const reasons = [
		{
			title: "Keep Your Chair",
			description:
				"Teaching is 2–3 days per cohort. You keep your clients, your income, and your craft sharp.",
		},
		{
			title: "Guild Membership",
			description:
				"Instructors receive guild membership, continuing education access, and visiting-artist priority.",
		},
		{
			title: "Shape the Standard",
			description:
				"You don't follow a curriculum — you help write it. Your techniques become the benchmark.",
		},
		{
			title: "Alumni Pipeline",
			description:
				"First look at graduating cohorts for your own shop. Many instructors hire their own students.",
		},
	];

	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="why-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="2"
					title="Why Teach at Unicorn?"
					id="why-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{reasons.map((reason, i) => (
						<Reveal key={reason.title} delay={i * 0.08}>
							<div className="p-6 border border-border bg-background">
								<h3 className="font-heading text-lg font-medium text-foreground">
									{reason.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{reason.description}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
