/* --------------------------- Instructors --------------------------- */

import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { SectionEyebrow } from "@/components/effects";
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

function InstructorCard({ instructor }: { instructor: Instructor }) {
	return (
		<Card className="gap-0 overflow-hidden hover:shadow-xl transition-all duration-300 rounded-none border-border p-0">
			<div className="relative h-80 overflow-hidden bg-secondary">
				<Image
					src={instructor.image}
					alt={`${instructor.name}, ${instructor.title}`}
					layout="constrained"
					width={480}
					height={600}
					loading="lazy"
					className="h-full w-full object-cover"
				/>
				<span className="absolute left-3 top-3 border border-primary/40 bg-secondary/85 px-2 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
					{instructor.memberNo}
				</span>
				{instructor.lead ? (
					<Badge className="absolute right-3 top-3 rounded-none border border-primary/40 bg-secondary/85 px-2 py-1 text-[10px] font-medium tracking-[0.16em] text-primary backdrop-blur-sm">
						LEAD
					</Badge>
				) : null}
			</div>

			<CardContent className="p-5">
				<h3 className="text-base font-semibold text-foreground">
					{instructor.name}
				</h3>
				<p className="mt-1 text-sm text-muted-foreground">{instructor.title}</p>
				<p className="mt-1 text-[11px] tracking-widest text-muted-foreground">
					{instructor.years} YRS EXPERIENCE
				</p>

				<ul className="mt-3 flex flex-wrap gap-1.5">
					{instructor.specialties.map((specialty) => (
						<li key={specialty}>
							<Badge
								variant="outline"
								className="rounded-none border-border text-[10px] font-normal tracking-[0.06em] text-muted-foreground"
							>
								{specialty.toUpperCase()}
							</Badge>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

export default function Instructors() {
	return (
		<section
			className="section-light border-t border-border bg-background px-6 py-24 lg:px-10"
			aria-labelledby="instructors-heading"
		>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(INSTRUCTORS_JSON_LD),
				}}
			/>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionEyebrow
						guard="4"
						title="Instructors"
						id="instructors-heading"
					/>
					<Link
						to="/instructors"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-muted-foreground hover:text-primary"
					>
						VIEW ALL INSTRUCTORS
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{INSTRUCTORS.map((instructor) => (
						<InstructorCard key={instructor.name} instructor={instructor} />
					))}
				</div>
			</div>
		</section>
	);
}
