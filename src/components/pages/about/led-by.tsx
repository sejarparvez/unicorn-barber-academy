import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Reveal, SectionEyebrow } from "@/components/effects";
import type { InstructorView } from "@/lib/content";

/* ----------------------------- Led by ----------------------------- */
/* Names the actual people, not just the philosophy — the two lead
   instructors, pulled from the same data the Instructors page uses. */

export default function LedBy({
	instructors,
}: {
	instructors: InstructorView[];
}) {
	const leads = instructors.filter((i) => i.lead);

	if (leads.length === 0) return null;

	return (
		<section
			className="section-light bg-background px-6 py-24 lg:px-10"
			aria-labelledby="led-by-heading"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionEyebrow title="Led By" id="led-by-heading" />
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
