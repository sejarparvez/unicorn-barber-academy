/* ----------------------------- Programs ----------------------------- */

import {
	IconArrowRight,
	IconScissors,
	IconSparkles,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { SectionEyebrow } from "@/components/site/decor";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	BARBERING_PROGRAMS,
	BEAUTY_PROGRAMS,
	type Program,
	SITE_URL,
} from "@/lib/site-data";

/** "14 weeks" -> "P14W" (ISO 8601 duration, for Course schema) */
const toIsoWeeks = (duration: string) => {
	const weeks = Number.parseInt(duration, 10);
	return Number.isFinite(weeks) ? `P${weeks}W` : undefined;
};

const ALL_PROGRAMS_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "ItemList",
	itemListElement: [...BARBERING_PROGRAMS, ...BEAUTY_PROGRAMS].map((p, i) => ({
		"@type": "Course",
		position: i + 1,
		name: p.title,
		description: p.description,
		educationalLevel: p.level,
		timeRequired: toIsoWeeks(p.duration),
		provider: {
			"@type": "EducationalOrganization",
			name: "Unicorn Barber Training Academy",
			sameAs: SITE_URL,
		},
		url: `${SITE_URL}${p.to}`,
	})),
};

/** e.g. "3 programs · 4–14 weeks" — computed from real data, not copy */
function trackSummary(programs: Program[]) {
	const weeks = programs.map((p) => Number.parseInt(p.duration, 10));
	const min = Math.min(...weeks);
	const max = Math.max(...weeks);
	const range = min === max ? `${min}` : `${min}–${max}`;
	return `${programs.length} programs · ${range} weeks`;
}

function ProgramCard({ program }: { program: Program }) {
	return (
		<Link to={program.to} className="group block">
			<Card className="gap-0 overflow-hidden rounded-none border-border bg-background p-0 transition-colors group-hover:border-primary/50">
				<div className="relative aspect-square overflow-hidden">
					<Image
						src={program.image}
						alt={program.alt}
						layout="constrained"
						width={480}
						height={600}
						loading="lazy"
						className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
					/>
					<Badge className="absolute left-3 top-3 rounded-none border border-primary/40 bg-secondary/85 px-2 py-1 text-[10px] font-medium tracking-[0.16em] text-primary backdrop-blur-sm">
						{program.level.toUpperCase()}
					</Badge>
				</div>

				<CardContent className="p-5">
					<div className="flex items-start justify-between gap-3">
						<h4 className="inline-flex items-center gap-1.5 text-lg font-semibold text-foreground">
							{program.title}
							<IconArrowRight
								className="h-3.5 w-3.5 shrink-0 text-primary opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
								stroke={1.75}
							/>
						</h4>
						<span className="shrink-0 whitespace-nowrap pt-1 text-[11px] tracking-[0.12em] text-muted-foreground">
							{program.duration.toUpperCase()}
						</span>
					</div>

					<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
						{program.description}
					</p>

					<ul className="mt-4 flex flex-wrap gap-1.5">
						{program.highlights.map((highlight) => (
							<li key={highlight}>
								<Badge
									variant="outline"
									className="rounded-none border-border text-[10px] font-normal tracking-[0.06em] text-muted-foreground"
								>
									{highlight.toUpperCase()}
								</Badge>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</Link>
	);
}

function ProgramTrack({
	trackId,
	icon,
	label,
	programs,
}: {
	trackId: string;
	icon: React.ReactNode;
	label: string;
	programs: Program[];
}) {
	return (
		<div>
			<div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
				<div className="flex items-center gap-2">
					{icon}
					<h3
						id={trackId}
						className="text-[12px] font-semibold tracking-[0.24em] text-primary"
					>
						{label.toUpperCase()}
					</h3>
				</div>
				<p className="text-[11px] tracking-[0.08em] text-muted-foreground">
					{trackSummary(programs)}
				</p>
			</div>

			<ul
				aria-labelledby={trackId}
				className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
			>
				{programs.map((program) => (
					<li key={program.title}>
						<ProgramCard program={program} />
					</li>
				))}
			</ul>
		</div>
	);
}

export default function Programs() {
	return (
		<section
			className="section-light border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="programs-heading"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(ALL_PROGRAMS_JSON_LD),
				}}
			/>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionEyebrow guard="2" title="Programs" id="programs-heading" />
					<Link
						to="/programs"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-muted-foreground hover:text-primary"
					>
						VIEW ALL PROGRAMS
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 space-y-16">
					<ProgramTrack
						trackId="barbering-track"
						icon={
							<IconScissors
								className="h-4 w-4 text-primary"
								stroke={1.75}
								aria-hidden="true"
							/>
						}
						label="Barbering Track"
						programs={BARBERING_PROGRAMS}
					/>
					<ProgramTrack
						trackId="beauty-track"
						icon={
							<IconSparkles
								className="h-4 w-4 text-primary"
								stroke={1.75}
								aria-hidden="true"
							/>
						}
						label="Beauty & Cosmetology Track"
						programs={BEAUTY_PROGRAMS}
					/>
				</div>
			</div>
		</section>
	);
}
