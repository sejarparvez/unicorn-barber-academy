import {
	IconArrowRight,
	IconAward,
	IconCheck,
	IconClock,
	IconScissors,
	IconUsers,
} from "@tabler/icons-react";
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
import { BEAUTY_PROGRAMS, type Program, pic, SITE_URL } from "@/lib/site-data";
import { SOCIAL_URLS } from "@/lib/social";
import { cn } from "@/lib/utils";

const program = BEAUTY_PROGRAMS.find(
	(p) => p.to === "/programs/bridal-and-editorial-makeup",
)!;

export const Route = createFileRoute("/programs/bridal-and-editorial-makeup")({
	component: ProgramPage,
	head: () => ({
		meta: [
			{ title: `${program.title} | Unicorn Barber Training Academy` },
			{
				name: "description",
				content: program.description,
			},
			{
				property: "og:title",
				content: `${program.title} | Unicorn Barber Training Academy`,
			},
			{ property: "og:description", content: program.description },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}${program.to}` },
			{ property: "og:image", content: program.image },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}${program.to}` }],
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
		{
			"@type": "ListItem",
			position: 3,
			name: program.title,
			item: `${SITE_URL}${program.to}`,
		},
	],
};

const COURSE_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "Course",
	name: program.title,
	description: program.description,
	provider: {
		"@type": "EducationalOrganization",
		name: "Unicorn Barber Training Academy",
		sameAs: [SOCIAL_URLS.instagram, SOCIAL_URLS.facebook, SOCIAL_URLS.youtube],
	},
	hasCourseInstance: [
		{
			"@type": "CourseInstance",
			courseMode: "part-time",
			courseSchedule: "Mo-Sa 09:00-19:00",
			location: {
				"@type": "Place",
				address: {
					"@type": "PostalAddress",
					streetAddress: "123 Fade Street",
					addressLocality: "Gulshan, Dhaka",
					postalCode: "1212",
					addressCountry: "BD",
				},
			},
		},
	],
};

const CURRICULUM = [
	{
		week: "Week 1",
		title: "Bridal Skin & Base Mastery",
		topics: [
			"Pre-wedding skin prep timeline (6-month → day-of)",
			"Long-wear base: primer, foundation, setting systems",
			"HD & flash photography considerations",
			"Touch-up kit assembly for the bride",
		],
	},
	{
		week: "Week 2",
		title: "Bridal Eye, Lip & Brow Design",
		topics: [
			"Eye shapes: customising shadow placement for photography",
			"Waterproof & transfer-proof techniques",
			"Brow mapping for bridal symmetry",
			"Lip design: lining, layering, longevity",
		],
	},
	{
		week: "Week 3",
		title: "Editorial & Creative Makeup",
		topics: [
			"Runway vs. editorial vs. bridal: brief interpretation",
			"Colour story development & mood boarding",
			"Graphic liner, colour blocking, texture play",
			"Working with photographers, stylists & art directors",
		],
	},
	{
		week: "Week 4",
		title: "Bridal Party & Business Systems",
		topics: [
			"Mother of the bride, bridesmaids, flower girls",
			"Timeline management: multiple faces, one schedule",
			"Contracts, trials, deposits & cancellation policy",
			"Portfolio building: test shoots & tear sheets",
		],
	},
	{
		week: "Week 5",
		title: "Practical Assessment & Portfolio Review",
		topics: [
			"Full bridal look on live model (timed)",
			"Editorial look on live model (creative brief)",
			"Portfolio presentation & critique",
			"Final NTVQF assessment",
		],
	},
];

const DETAILS = [
	{ icon: IconClock, label: "Duration", value: program.duration },
	{ icon: IconUsers, label: "Cohort Size", value: "Max 10 students" },
	{ icon: IconAward, label: "Certification", value: "NTVQF Specialisation" },
	{
		icon: IconScissors,
		label: "Prerequisite",
		value: "Cosmetology Fundamentals or makeup experience",
	},
];

function ProgramPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_JSON_LD) }}
			/>
			<ProgramHero />
			<ProgramDetails />
			<Curriculum />
			<FinalCta
				title="Makeup that lasts."
				accent="Five weeks. Camera-ready every time."
				subtitle="Bridal & editorial — two distinct markets, one advanced certification. Only 10 seats per cohort."
			/>
		</main>
	);
}

function ProgramHero() {
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
					src={program.image}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-bridal-hero-2", 900, 1100)}
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
					<Link to="/programs" className="hover:text-primary">
						PROGRAMS
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">BEAUTY</span>
					<span aria-hidden="true">/</span>
					<span>{program.title.toUpperCase()}</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					{program.title}{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>
						{program.duration}
					</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					{program.description}
				</motion.p>

				<motion.div
					{...fadeUp(0.26)}
					className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] tracking-[0.18em] text-secondary-foreground/55"
				>
					<span>{program.level.toUpperCase()}</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>DAY & EVENING COHORTS</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>NTVQF CERTIFIED</span>
				</motion.div>
			</div>
		</section>
	);
}

function ProgramDetails() {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="details-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="1"
					title="Program at a Glance"
					id="details-heading"
				/>
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{DETAILS.map((detail, i) => (
						<Reveal key={detail.label} delay={i * 0.08}>
							<div className="flex flex-col items-center text-center p-6 border border-border">
								<detail.icon
									className="h-7 w-7 text-primary"
									stroke={1.5}
									aria-hidden="true"
								/>
								<p className="mt-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
									{detail.label.toUpperCase()}
								</p>
								<p className="mt-1 font-heading text-lg font-medium text-foreground">
									{detail.value}
								</p>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function Curriculum() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="curriculum-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="2"
					title="Curriculum Breakdown"
					id="curriculum-heading"
				/>
				<div className="mt-14 space-y-10">
					{CURRICULUM.map((module, i) => (
						<Reveal key={module.week} delay={i * 0.08} className="relative">
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
								<div className="flex items-baseline gap-3">
									<span
										className={cn(
											"font-heading text-2xl font-medium",
											GOLD_TEXT,
										)}
									>
										{module.week}
									</span>
									<h3 className="font-heading text-xl font-medium text-foreground">
										{module.title}
									</h3>
								</div>
								<IconCheck
									className="h-5 w-5 shrink-0 text-primary"
									stroke={1.75}
								/>
							</div>
							<ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pl-10 sm:pl-0">
								{module.topics.map((topic) => (
									<li
										key={topic}
										className="flex items-start gap-2 text-sm text-muted-foreground"
									>
										<IconCheck
											className="mt-0.5 h-4 w-4 shrink-0 text-primary/60"
											stroke={1.75}
										/>
										<span>{topic}</span>
									</li>
								))}
							</ul>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
