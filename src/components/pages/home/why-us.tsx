/* --------------------------- Why Unicorn --------------------------- */

import {
	IconBriefcase,
	IconClockHour4,
	IconScissors,
	IconUsers,
} from "@tabler/icons-react";

import { SectionEyebrow } from "@/components/site/decor";

const FEATURES = [
	{
		icon: IconScissors,
		title: "Taught by Working Professionals",
		description:
			"Every instructor still works a chair or a station. You learn what's current, not what's textbook.",
	},
	{
		icon: IconBriefcase,
		title: "Full Kit Included",
		description:
			"Clippers and shears, or a professional makeup and styling kit — yours from week one. No extra spend.",
	},
	{
		icon: IconUsers,
		title: "Job Placement Support",
		description:
			"Sixty partner salons and barbershops hire straight out of our cohorts.",
	},
	{
		icon: IconClockHour4,
		title: "Day & Evening Cohorts",
		description:
			"Train around a job or family. Same curriculum, same instructors, your schedule.",
	},
];

export default function WhyUnicorn() {
	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="why-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow guard="1" title="Why Unicorn" id="why-heading" />
				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature) => (
						<div
							key={feature.title}
							className="bg-background p-8 transition-colors hover:bg-primary/5"
						>
							<feature.icon
								className="h-7 w-7 text-primary"
								stroke={1.5}
								aria-hidden="true"
							/>
							<h3 className="mt-5 text-base font-semibold text-foreground">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
