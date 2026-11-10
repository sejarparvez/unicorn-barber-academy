import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { InstructorView } from "@/lib/content";

/* ----------------------------- Hero ----------------------------- */
/* A manifesto, not a data panel or a photo backdrop. The two lead
   instructors' portraits sit offset and overlapping — a founders'
   duo, pulled live from the instructor roster rather than hardcoded — paired
   with an actual attributed quote instead of a generic tagline. */

export default function AboutHero({
	instructors,
}: {
	instructors: InstructorView[];
}) {
	const leads = instructors.filter((i) => i.lead);
	const [primaryLead, secondaryLead] = leads;

	return (
		<section className="border-b border-border px-6 pt-28 pb-20 lg:px-10 lg:pt-36 lg:pb-24">
			<h1 className="sr-only">About Unicorn Barber Training Academy</h1>
			<div className="mx-auto max-w-7xl">
				<div className="flex items-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/80">
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
									<span className="block text-secondary-foreground/80">
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
