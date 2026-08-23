// src/features/blog/blog-page.tsx
// Placeholder until the journal ships — keeps the nav link out of 404s
// while giving crawlers/LLMs a real, indexable page to land on.
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { FinalCta, Reveal } from "@/components/effects";
import { cn } from "@/lib/utils";

export function BlogPage() {
	return (
		<main>
			<section className="relative overflow-hidden bg-background px-6 py-28 lg:px-10">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="font-mono text-[11px] tracking-[0.32em] text-primary">
						THE JOURNAL
					</p>
					<h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
						Articles are <span className="italic">on the way.</span>
					</h1>
					<p className="mt-6 text-base leading-relaxed text-secondary-foreground/70">
						We&rsquo;re writing about fade technique, razor discipline, building
						a client book, and what it takes to go from student to chair-ready
						professional. Check back soon — or start training with us in the
						meantime.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							to="/programs"
							className={cn(
								"inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
							)}
						>
							BROWSE PROGRAMS
							<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
						</Link>
					</div>
				</Reveal>
			</section>
			<FinalCta
				title="Don't just read about it —"
				accent="learn it."
				subtitle="Seats in the next cohort are limited to keep instructor time one-on-one."
			/>
		</main>
	);
}
