// src/features/about/about-page.tsx
import {
	IconArrowRight,
	IconCertificate,
	IconScissors,
	IconUserCheck,
	IconUsersGroup,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
	FinalCta,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/effects";
import { Card, CardContent } from "@/components/ui/card";
import { pic } from "@/data/images";
import { INSTRUCTORS } from "@/data/instructors";
import { CONTACT, SITE_URL } from "@/data/site";
import { stringifyJsonLd } from "@/lib/jsonld";
import { SOCIAL_URLS } from "@/lib/social";

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
	// Same @id as the footer's LocalBusiness block — one merged entity for
	// search engines, not two competing organizations.
	"@id": `${SITE_URL}/#academy`,
	"@type": ["EducationalOrganization", "LocalBusiness"],
	name: "Unicorn Barber Training Academy",
	url: SITE_URL,
	logo: `${SITE_URL}/logo.png`,
	foundingDate: "2016",
	sameAs: [
		SOCIAL_URLS.instagram,
		SOCIAL_URLS.facebook,
		SOCIAL_URLS.youtube,
		SOCIAL_URLS.tiktok,
		SOCIAL_URLS.x,
	],
	address: {
		"@type": "PostalAddress",
		streetAddress: CONTACT.streetAddress,
		addressLocality: CONTACT.addressLocality,
		postalCode: CONTACT.postalCode,
		addressCountry: CONTACT.addressCountry,
	},
	contactPoint: {
		"@type": "ContactPoint",
		telephone: CONTACT.phoneE164,
		contactType: "admissions",
		availableLanguage: ["Bengali", "English"],
	},
};

const ABOUT_PAGE_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "AboutPage",
	name: "About Unicorn Barber Training Academy",
	url: `${SITE_URL}/about`,
	mainEntity: { "@id": `${SITE_URL}/#academy` },
};

export function AboutPage() {
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
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(ORG_JSON_LD) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: stringifyJsonLd(ABOUT_PAGE_JSON_LD),
				}}
			/>
			<AboutHero />
			<OurStory />
			<OurApproach />
			<LedBy />
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

/* ----------------------------- Hero ----------------------------- */
/* A manifesto, not a data panel or a photo backdrop. The two lead
   instructors' portraits sit offset and overlapping — a founders'
   duo, pulled live from INSTRUCTORS rather than hardcoded — paired
   with an actual attributed quote instead of a generic tagline. */

function AboutHero() {
	const leads = INSTRUCTORS.filter((i) => i.lead);
	const [primaryLead, secondaryLead] = leads;

	return (
		<section className="border-b border-border px-6 pt-28 pb-20 lg:px-10 lg:pt-36 lg:pb-24">
			<h1 className="sr-only">About Unicorn Barber Training Academy</h1>
			<div className="mx-auto max-w-7xl">
				<div className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65">
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">ABOUT</span>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-16 lg:grid-cols-5 lg:items-center">
					{/* Left: manifesto */}
					<div className="lg:col-span-3">
						<p className="text-[11px] tracking-[0.32em] text-primary">
							FOUNDED IN GULSHAN, 2016
						</p>

						<blockquote className="mt-6 font-heading text-3xl font-medium leading-[1.2] sm:text-4xl lg:text-[2.6rem]">
							&ldquo;We didn&rsquo;t set out to build a classroom. We built the
							shop we wished we&rsquo;d trained in &mdash; small cohorts, real
							clients, and instructors who still work the chair.&rdquo;
							<footer className="mt-6 text-base font-normal text-secondary-foreground/70">
								<cite className="not-italic">
									&mdash; {primaryLead ? primaryLead.name : "Our Founders"}
									{secondaryLead ? ` & ${secondaryLead.name}` : ""}, Founding
									Instructors
								</cite>
							</footer>
						</blockquote>

						<div className="mt-10 flex flex-wrap gap-4">
							<Link
								to="/contact"
								className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
							>
								SCHEDULE A VISIT
							</Link>
							<Link
								to="/instructors"
								className="inline-flex items-center gap-2 border border-secondary-foreground/25 px-6 py-3.5 text-[12px] font-semibold tracking-[0.16em] text-secondary-foreground transition-colors hover:border-primary hover:text-primary"
							>
								MEET THE FACULTY
								<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
							</Link>
						</div>
					</div>

					{/* Right: founders' duo — offset portraits, not a backdrop */}
					<div className="relative mx-auto h-88 w-full max-w-xs sm:h-104 lg:col-span-2 lg:h-120 lg:max-w-none">
						{secondaryLead && (
							<div className="absolute right-0 top-0 h-[70%] w-[64%] overflow-hidden border border-primary/30">
								<Image
									src={secondaryLead.image}
									alt={secondaryLead.name}
									layout="constrained"
									width={420}
									height={520}
									className="h-full w-full object-cover grayscale"
								/>
								<span className="absolute inset-x-0 bottom-0 bg-secondary/85 px-3 py-2 text-[10px] tracking-[0.14em] text-secondary-foreground/80 backdrop-blur-sm">
									{secondaryLead.name.toUpperCase()}
									<span className="block text-secondary-foreground/70">
										{secondaryLead.title}
									</span>
								</span>
							</div>
						)}
						{primaryLead && (
							<div className="absolute bottom-0 left-0 h-[70%] w-[64%] overflow-hidden border-2 border-primary shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
								<Image
									src={primaryLead.image}
									alt={primaryLead.name}
									layout="constrained"
									width={420}
									height={520}
									fetchPriority="high"
									loading="eager"
									className="h-full w-full object-cover"
								/>
								<span className="absolute inset-x-0 bottom-0 bg-secondary/85 px-3 py-2 text-[10px] tracking-[0.14em] text-primary backdrop-blur-sm">
									{primaryLead.name.toUpperCase()}
									<span className="block text-secondary-foreground/60">
										{primaryLead.title}
									</span>
								</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
/* ----------------------------- Our story ----------------------------- */

function OurStory() {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="story-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="2" title="Our Story" id="story-heading" />
				<div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
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

					<div className="relative aspect-4/3 overflow-hidden">
						<Image
							src={pic("unicorn-about-story", 800, 600)}
							alt="Unicorn Barber Training Academy studio floor with students at work"
							layout="constrained"
							width={800}
							height={600}
							loading="lazy"
							className="h-full w-full object-cover"
						/>
						<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.18em] text-primary backdrop-blur-sm">
							STUDIO FLOOR &mdash; GULSHAN, DHAKA
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Our approach ----------------------------- */

const PILLARS = [
	{
		icon: IconUserCheck,
		title: "Working Professionals Only",
		description:
			"No career academics. Every instructor earns their living cutting, colouring, or styling — then teaches what they did that week.",
	},
	{
		icon: IconUsersGroup,
		title: "Capped at 12",
		description:
			"Small cohorts mean more one-on-one time, more client rotations, and no hiding in the back row.",
	},
	{
		icon: IconScissors,
		title: "Real Clients, Real Pressure",
		description:
			"Students work on paying clients from week three. You learn speed, consultation, and retail under actual shop conditions.",
	},
	{
		icon: IconCertificate,
		title: "NTVQF Certified",
		description:
			"Nationally recognised qualifications that employers trust and the guild endorses. Your certificate travels with you.",
	},
];

function OurApproach() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="approach-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="3"
					title="How We're Different"
					id="approach-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{PILLARS.map((pillar, i) => (
						<Reveal key={pillar.title} delay={i * 0.08}>
							<Card className="h-full rounded-none border-border bg-background">
								<CardContent className="p-6">
									<pillar.icon
										className="h-7 w-7 text-primary"
										stroke={1.5}
										aria-hidden="true"
									/>
									<h3 className="mt-4 font-heading text-xl font-medium text-foreground">
										{pillar.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{pillar.description}
									</p>
								</CardContent>
							</Card>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- Led by ----------------------------- */
/* Names the actual people, not just the philosophy — the two lead
   instructors, pulled from the same data the Instructors page uses. */

function LedBy() {
	const leads = INSTRUCTORS.filter((i) => i.lead);

	if (leads.length === 0) return null;

	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="led-by-heading"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionEyebrow guard="4" title="Led By" id="led-by-heading" />
					<Link
						to="/instructors"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-muted-foreground hover:text-primary"
					>
						MEET THE FULL FACULTY
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
					{leads.map((lead, i) => (
						<Reveal key={lead.name} delay={i * 0.08}>
							<Link
								to="/instructors"
								className="group flex items-center gap-5 border border-border p-6 transition-colors hover:border-primary/40"
							>
								<Image
									src={lead.image}
									alt={lead.name}
									layout="constrained"
									width={80}
									height={80}
									className="h-20 w-20 shrink-0 rounded-full object-cover grayscale transition-all group-hover:grayscale-0"
								/>
								<span>
									<span className="block text-base font-semibold text-foreground group-hover:text-primary">
										{lead.name}
									</span>
									<span className="mt-1 block text-sm text-muted-foreground">
										{lead.title}
									</span>
									<span className="mt-1 block text-[11px] tracking-widest text-muted-foreground">
										{lead.years}+ YRS EXPERIENCE
									</span>
								</span>
							</Link>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* ----------------------------- The guild ----------------------------- */

const CREDENTIALS = [
	"Nationally Registered Training Provider (BTEB)",
	"NTVQF Certified Curriculum Levels 2–4",
	"Member, Bangladesh Barbers & Beauticians Guild",
	"Partner salons & barbershops across Dhaka",
];

function TheGuild() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="guild-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="5"
					title="Guild & Accreditation"
					id="guild-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{CREDENTIALS.map((cred, i) => (
						<Reveal key={cred} delay={i * 0.06}>
							<Card className="h-full rounded-none border-border bg-background">
								<CardContent className="p-6">
									<GuildSeal
										className="h-10 w-10 text-primary/60"
										aria-hidden="true"
									/>
									<p className="mt-3 text-sm leading-relaxed text-foreground">
										{cred}
									</p>
								</CardContent>
							</Card>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
