// src/features/instructors/instructors-page.tsx
import { IconArrowRight, IconAward, IconBriefcase } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
	FinalCta,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/effects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Instructor } from "@/data/instructors";
import { INSTRUCTORS } from "@/data/instructors";
import { SITE_URL } from "@/data/site";

const INSTRUCTORS_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "ItemList",
	itemListElement: INSTRUCTORS.map((person, i) => ({
		"@type": "Person",
		position: i + 1,
		name: person.name,
		jobTitle: person.title,
		description: person.bio,
		knowsAbout: person.specialties,
		worksFor: {
			"@type": "EducationalOrganization",
			name: "Unicorn Barber Training Academy",
			sameAs: SITE_URL,
		},
	})),
};

const BREADCRUMB_JSON_LD = {
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

export function InstructorsPage() {
	const leads = INSTRUCTORS.filter((i) => i.lead);
	const barberingFaculty = INSTRUCTORS.filter(
		(i) => !i.lead && i.track === "barbering",
	);
	const beautyFaculty = INSTRUCTORS.filter(
		(i) => !i.lead && i.track === "beauty",
	);

	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(BREADCRUMB_JSON_LD),
				}}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(INSTRUCTORS_JSON_LD),
				}}
			/>
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
/* ----------------------------- Spotlight ----------------------------- */
/* The two lead instructors, presented as oversized membership cards —
   the guild-member motif carried to its most detailed form. */

function Spotlight({ leads }: { leads: Instructor[] }) {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="leads-heading"
		>
			<h1 className="sr-only">Meet the Instructors</h1>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Lead Instructors" id="leads-heading" />
				<div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{leads.map((lead, i) => (
						<Reveal key={lead.name} delay={i * 0.1}>
							<Card className="group h-full gap-0 overflow-hidden rounded-none border-border p-0">
								<div className="flex h-full flex-col sm:flex-row">
									<div className="relative aspect-4/5 w-full overflow-hidden sm:w-2/5">
										<Image
											src={lead.image}
											alt={`${lead.name}, ${lead.title}`}
											layout="constrained"
											width={480}
											height={600}
											loading="lazy"
											className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
										/>
										<span className="absolute left-4 top-4 border border-primary/60 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
											MEMBER &#8470; {lead.memberNo}
										</span>
									</div>
									<CardContent className="relative flex flex-1 flex-col justify-between p-8">
										<GuildSeal className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 text-primary/5" />
										<div className="relative">
											<h3 className="font-heading text-2xl font-medium text-foreground">
												{lead.name}
											</h3>
											<p className="mt-1 text-sm text-primary">{lead.title}</p>
											<p className="mt-1 text-[11px] tracking-widest text-muted-foreground">
												{lead.years}+ YEARS EXPERIENCE
											</p>
											<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
												{lead.bio}
											</p>
											<ul className="mt-5 flex flex-wrap gap-2">
												{lead.specialties.map((s) => (
													<li key={s}>
														<Badge
															variant="outline"
															className="rounded-none border-border text-[10px] font-normal tracking-[0.06em] text-muted-foreground"
														>
															{s}
														</Badge>
													</li>
												))}
											</ul>
										</div>
										<div className="relative mt-6">
											<Link
												to={lead.teaches.to}
												className="group/link inline-flex items-center gap-1.5 text-[12px] font-medium tracking-widest text-primary"
											>
												TEACHES {lead.teaches.program.toUpperCase()}
												<IconArrowRight
													className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1"
													stroke={1.75}
												/>
											</Link>
										</div>
									</CardContent>
								</div>
							</Card>
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
		<Card className="group h-full gap-0 overflow-hidden rounded-none border-border bg-background p-0 transition-colors hover:border-primary/40">
			<div className="relative aspect-4/5 overflow-hidden">
				<span className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
				<Image
					src={instructor.image}
					alt={`${instructor.name}, ${instructor.title}`}
					layout="constrained"
					width={480}
					height={600}
					loading="lazy"
					className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
				/>
				<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
					MEMBER &#8470; {instructor.memberNo}
				</span>
			</div>
			<CardContent className="flex flex-1 flex-col p-6">
				<h3 className="font-heading text-lg font-medium text-foreground">
					{instructor.name}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">{instructor.title}</p>
				<p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
					{instructor.bio}
				</p>
				<ul className="mt-4 flex flex-wrap gap-2">
					{instructor.specialties.map((s) => (
						<li key={s}>
							<Badge
								variant="outline"
								className="rounded-none border-border text-[10px] font-normal tracking-[0.06em] text-muted-foreground"
							>
								{s}
							</Badge>
						</li>
					))}
				</ul>
				<div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
					<span className="flex items-center gap-1.5 text-[11px] tracking-widest text-primary">
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
			</CardContent>
		</Card>
	);
}

/* ----------------------------- Open chair ----------------------------- */
/* Recruiting section — a real thing a training academy does, not
   decoration for its own sake. Kept deliberately small and quiet. */

function OpenChair() {
	return (
		<section className="section-light border-t border-border bg-background px-6 py-20 lg:px-10">
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
