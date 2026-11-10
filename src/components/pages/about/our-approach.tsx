import {
	IconCertificate,
	IconScissors,
	IconUserCheck,
	IconUsersGroup,
} from "@tabler/icons-react";
import { Reveal, SectionEyebrow } from "@/components/effects";
import { Card, CardContent } from "@/components/ui/card";

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

export default function OurApproach() {
	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="approach-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow title="How We're Different" id="approach-heading" />
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
