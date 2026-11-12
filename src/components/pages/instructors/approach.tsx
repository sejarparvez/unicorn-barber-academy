import {
	IconEye,
	IconHandStop,
	IconMessage2,
	IconQuote,
	IconUsers,
} from '@tabler/icons-react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Badge } from '@/components/ui/badge';
import { INSTRUCTORS } from '@/data/instructors';

const STEPS = [
	{
		icon: IconEye,
		title: 'Demonstration',
		description:
			'Your instructor cuts first, narrating every angle, guard and check before you pick up a tool.',
	},
	{
		icon: IconHandStop,
		title: 'Guided practice',
		description:
			'You repeat the work on a mannequin with the same tools, while they watch your grip, posture and sectioning.',
	},
	{
		icon: IconMessage2,
		title: 'Correction',
		description:
			'Mistakes get caught in the moment — not three weeks later, once they have already become a habit.',
	},
	{
		icon: IconUsers,
		title: 'Live floor',
		description:
			'Supervised client work, real timing and a portfolio of cuts you can defend in an interview.',
	},
];

const CLASS_TAGS = ['Live models', 'Real clients', 'Portfolio shots'];

export default function InstructorsApproach() {
	const featured = INSTRUCTORS[0];

	return (
		<section
			aria-labelledby="approach-heading"
			className="relative overflow-hidden border-border border-b bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/3 size-[32rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[130px]"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-20 [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
			/>

			<div className="relative mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
				<div className="lg:sticky lg:top-24 lg:self-start">
					<SectionHeading
						id="approach-heading"
						eyebrow="Inside a class"
						title={
							<>
								Watch it. Try it. Get{' '}
								<span className="text-primary">corrected</span>.
							</>
						}
						description="Nobody learns a fade from a slideshow. Class follows the same rhythm every day, on every track — and the instructor is always close enough to stop a bad habit."
					/>

					<figure className="relative mt-8 overflow-hidden rounded-xl border border-primary/20 bg-card/50 p-5 sm:p-6">
						<span
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
						/>
						<IconQuote
							className="size-7 text-primary/40"
							stroke={1.5}
							aria-hidden="true"
						/>
						<blockquote className="mt-3 text-pretty text-foreground/80 text-sm leading-relaxed">
							&ldquo;{featured.quote}&rdquo;
						</blockquote>
						<figcaption className="mt-4 flex items-center gap-3 border-border/60 border-t pt-4">
							<span className="h-px w-6 bg-primary/60" aria-hidden="true" />
							<span>
								<span className="block font-semibold text-foreground text-xs">
									{featured.name}
								</span>
								<span className="mt-0.5 block text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
									{featured.role}
								</span>
							</span>
						</figcaption>
					</figure>

					<ul className="mt-6 flex flex-wrap gap-1.5">
						{CLASS_TAGS.map((tag) => (
							<li key={tag}>
								<Badge
									variant="outline"
									className="text-[9px] text-muted-foreground uppercase tracking-[0.14em]"
								>
									{tag}
								</Badge>
							</li>
						))}
					</ul>
				</div>

				<div>
					<div className="flex items-center justify-between gap-4 border-border/60 border-b pb-4">
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							The class rhythm
						</p>
						<span className="font-mono text-[10px] text-muted-foreground/50 tracking-[0.2em]">
							01 — 04
						</span>
					</div>

					<ol className="divide-y divide-border/60">
						{STEPS.map((step, index) => (
							<li
								key={step.title}
								className="group grid grid-cols-[auto_1fr] gap-5 py-7"
							>
								<div className="flex flex-col items-center gap-3">
									<span className="font-mono text-[10px] text-primary tracking-[0.16em]">
										{String(index + 1).padStart(2, '0')}
									</span>
									<span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:border-primary/35 group-hover:bg-primary/10">
										<step.icon
											className="size-5"
											stroke={1.5}
											aria-hidden="true"
										/>
									</span>
								</div>

								<div className="pt-0.5">
									<h3 className="font-semibold text-base text-foreground tracking-tight transition-colors group-hover:text-primary">
										{step.title}
									</h3>
									<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
										{step.description}
									</p>
								</div>
							</li>
						))}
					</ol>

					<p className="mt-6 rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-muted-foreground text-xs leading-relaxed">
						This is why cohorts are capped. An instructor cannot correct a grip
						they cannot see.
					</p>
				</div>
			</div>
		</section>
	);
}
