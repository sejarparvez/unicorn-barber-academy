import {
	IconArrowRight,
	IconAward,
	IconBrandInstagram,
	IconBriefcase,
	IconQuote,
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
import { INSTRUCTORS, type Instructor, pic, SITE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/instructors")({
	component: InstructorsPage,
	head: () => ({
		meta: [
			{ title: "Instructors | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Meet the working barbers and beauty professionals teaching at Unicorn Barber Training Academy in Dhaka — every instructor still works a chair or a station.",
			},
			{
				property: "og:title",
				content: "Instructors | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Meet the working professionals teaching every program at Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/instructors` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/instructors` }],
	}),
});

const JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Instructors",
			item: `${SITE_URL}/instructors`,
		},
	],
};

function InstructorsPage() {
	const leads = INSTRUCTORS.filter((i) => i.lead);
	const barberingFaculty = INSTRUCTORS.filter(
		(i) => !i.lead && i.track === "barbering",
	);
	const beautyFaculty = INSTRUCTORS.filter(
		(i) => !i.lead && i.track === "beauty",
	);
	const totalYears = INSTRUCTORS.reduce((sum, i) => sum + i.years, 0);

	return (
		<main>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
			/>
			<FacultyHero totalYears={totalYears} />
			<Spotlight leads={leads} />
			<FacultyGroup
				guard="2"
				title="Barbering Faculty"
				instructors={barberingFaculty}
			/>
			<FacultyGroup
				guard="3"
				title="Beauty & Cosmetology Faculty"
				instructors={beautyFaculty}
			/>
			<OpenChair />
			<FinalCta
				title="Learn from someone who's"
				accent="still behind the chair."
				subtitle="Every instructor at Unicorn teaches the technique they use on paying clients the same week. Apply to train under them."
			/>
		</main>
	);
}

/* ----------------------------- Hero ----------------------------- */

function FacultyHero({ totalYears }: { totalYears: number }) {
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
					src={pic("unicorn-faculty-hero-1", 700, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-faculty-hero-2", 700, 1100)}
					alt=""
					className="hidden h-full w-full object-cover opacity-40 sm:block"
				/>
				<img
					src={pic("unicorn-faculty-hero-3", 700, 1100)}
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
					<span className="text-primary">INSTRUCTORS</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					The{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>faculty.</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Six working professionals, {totalYears}+ years behind the chair
					between them. Nobody here teaches full-time — everybody here still
					cuts, colours, or does makeup for paying clients.
				</motion.p>

				<motion.div
					{...fadeUp(0.26)}
					className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] tracking-[0.18em] text-secondary-foreground/55"
				>
					<span>{INSTRUCTORS.length} INSTRUCTORS</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>{totalYears}+ COMBINED YEARS</span>
					<span className="h-1 w-1 rounded-full bg-primary/50" />
					<span>GUILD REGISTERED</span>
				</motion.div>
			</div>
		</section>
	);
}

/* ----------------------------- Spotlight ----------------------------- */
/* The two lead instructors, presented as oversized membership cards —
   the guild-member motif carried to its most detailed form. */

function Spotlight({ leads }: { leads: Instructor[] }) {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="leads-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Lead Instructors" id="leads-heading" />
				<div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{leads.map((lead, i) => (
						<Reveal key={lead.name} delay={i * 0.1}>
							<article className="group relative flex h-full flex-col overflow-hidden border border-border sm:flex-row">
								<div className="relative aspect-[4/5] w-full overflow-hidden sm:w-2/5">
									<img
										src={lead.image}
										alt={`${lead.name}, ${lead.title}`}
										loading="lazy"
										className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
									/>
									<span className="absolute left-4 top-4 border border-primary/60 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
										MEMBER &#8470; {lead.memberNo}
									</span>
								</div>
								<div className="relative flex flex-1 flex-col justify-between p-8">
									<GuildSeal className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 text-primary/[0.05]" />
									<div className="relative">
										<h3 className="font-heading text-2xl font-medium text-foreground">
											{lead.name}
										</h3>
										<p className="mt-1 text-sm text-primary">{lead.title}</p>
										<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
											{lead.bio}
										</p>
										{lead.quote && (
											<blockquote className="mt-5 flex gap-3 border-l-2 border-primary/40 pl-4 text-sm italic leading-relaxed text-foreground/80">
												<IconQuote
													className="h-4 w-4 shrink-0 text-primary/50"
													stroke={1.5}
												/>
												<span>{lead.quote}</span>
											</blockquote>
										)}
										<ul className="mt-5 flex flex-wrap gap-2">
											{lead.specialties.map((s) => (
												<li
													key={s}
													className="border border-border px-2.5 py-1 text-[10px] tracking-[0.06em] text-muted-foreground"
												>
													{s}
												</li>
											))}
										</ul>
									</div>
									<div className="relative mt-6 flex items-center justify-between gap-4">
										<Link
											to={lead.teaches.to}
											className="group/link inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.1em] text-primary"
										>
											TEACHES {lead.teaches.program.toUpperCase()}
											<IconArrowRight
												className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1"
												stroke={1.75}
											/>
										</Link>
										<a
											href={lead.instagram}
											target="_blank"
											rel="noreferrer"
											aria-label={`${lead.name} on Instagram`}
											className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
										>
											<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
										</a>
									</div>
								</div>
							</article>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

/* --------------------------- Faculty groups --------------------------- */

function FacultyGroup({
	guard,
	title,
	instructors,
}: {
	guard: string;
	title: string;
	instructors: Instructor[];
}) {
	const headingId = `faculty-${guard}`;
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby={headingId}
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard={guard} title={title} id={headingId} />
				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{instructors.map((instructor, i) => (
						<Reveal key={instructor.name} delay={i * 0.08}>
							<MembershipCard instructor={instructor} />
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function MembershipCard({ instructor }: { instructor: Instructor }) {
	return (
		<div className="group flex h-full flex-col overflow-hidden border border-border bg-background transition-colors hover:border-primary/40">
			<div className="relative aspect-[4/5] overflow-hidden">
				<span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
				<img
					src={instructor.image}
					alt={`${instructor.name}, ${instructor.title}`}
					loading="lazy"
					className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
				/>
				<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
					MEMBER &#8470; {instructor.memberNo}
				</span>
			</div>
			<div className="flex flex-1 flex-col p-6">
				<div className="flex items-start justify-between gap-3">
					<div>
						<h3 className="font-heading text-lg font-medium text-foreground">
							{instructor.name}
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							{instructor.title}
						</p>
					</div>
					<a
						href={instructor.instagram}
						target="_blank"
						rel="noreferrer"
						aria-label={`${instructor.name} on Instagram`}
						className="flex h-8 w-8 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
					>
						<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
					</a>
				</div>
				<p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
					{instructor.bio}
				</p>
				<ul className="mt-4 flex flex-wrap gap-2">
					{instructor.specialties.map((s) => (
						<li
							key={s}
							className="border border-border px-2.5 py-1 text-[10px] tracking-[0.06em] text-muted-foreground"
						>
							{s}
						</li>
					))}
				</ul>
				<div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
					<span className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] text-primary">
						<IconAward className="h-3.5 w-3.5" stroke={1.75} />
						{instructor.years}+ YEARS
					</span>
					<Link
						to={instructor.teaches.to}
						className="group/link inline-flex items-center gap-1 text-[11px] font-medium tracking-[0.08em] text-muted-foreground hover:text-primary"
					>
						{instructor.teaches.program.toUpperCase()}
						<IconArrowRight
							className="h-3 w-3 transition-transform group-hover/link:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>
			</div>
		</div>
	);
}

/* ----------------------------- Open chair ----------------------------- */
/* Recruiting section — a real thing a training academy does, not
   decoration for its own sake. Kept deliberately small and quiet. */

function OpenChair() {
	return (
		<section className="border-t border-border bg-background px-6 py-20 lg:px-10">
			<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 border border-dashed border-primary/30 px-8 py-10 text-center lg:flex-row lg:text-left">
				<div className="flex items-center gap-4">
					<IconBriefcase
						className="h-8 w-8 shrink-0 text-primary"
						stroke={1.5}
						aria-hidden="true"
					/>
					<div>
						<h3 className="font-heading text-xl font-medium text-foreground">
							Teach at Unicorn
						</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							We take on one or two working professionals a year as instructors.
							No teaching experience required — just a chair you're proud of.
						</p>
					</div>
				</div>
				<Link
					to="/contact"
					className="shrink-0 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
				>
					INQUIRE ABOUT OPENINGS
				</Link>
			</div>
		</section>
	);
}
