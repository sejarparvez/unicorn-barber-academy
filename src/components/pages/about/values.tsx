import {
	IconBriefcase,
	IconScissors,
	IconUsers,
	IconUsersGroup,
} from '@tabler/icons-react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const VALUES = [
	{
		icon: IconScissors,
		title: 'Craft first',
		description:
			'Fundamentals before trends. Every technique is drilled until it holds up on a real head, not just a mannequin.',
	},
	{
		icon: IconUsers,
		title: 'Real work, day one',
		description:
			'Mannequins become models, models become clients. You practise under supervision instead of watching from a desk.',
	},
	{
		icon: IconUsersGroup,
		title: 'Small by design',
		description:
			'Capped cohorts mean your instructor sees your hands, corrects your grip and catches the habit before it sets in.',
	},
	{
		icon: IconBriefcase,
		title: 'Hired, not just certified',
		description:
			'Portfolio reviews, interview prep and warm introductions to the salons and barbershops already hiring.',
	},
];

export default function Values() {
	return (
		<section
			aria-labelledby="values-heading"
			className="relative overflow-hidden border-b border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-1/2 left-0 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[130px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="values-heading"
						eyebrow="What we believe"
						title={
							<>
								Four things we refuse to{' '}
								<span className="text-primary">compromise</span>.
							</>
						}
						description="These are not values on a wall. They are the decisions that shape every cohort, every kit and every class."
					/>

					<Badge
						variant="outline"
						className="shrink-0 self-start border-primary/30 text-[9px] text-primary tracking-[0.18em] sm:self-auto"
					>
						THE UNICORN WAY
					</Badge>
				</div>

				<div className="mt-14 grid gap-4 lg:grid-cols-12">
					{/* ── Featured promise card ── */}
					<Card className="relative overflow-hidden border border-primary/25 bg-primary/[0.04] lg:col-span-4">
						<span
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent"
						/>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute -right-10 -bottom-12 text-primary/[0.07]"
						>
							<IconScissors className="size-56 -rotate-12" stroke={1} />
						</div>

						<CardContent className="relative flex h-full flex-col justify-between gap-10 py-2">
							<div>
								<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
									Our promise
								</p>
								<p className="mt-5 text-balance font-semibold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl">
									You leave with a skill, not just a certificate.
								</p>
								<p className="mt-4 max-w-xs text-muted-foreground text-sm leading-relaxed">
									That means chair time, correction in the moment, and a
									portfolio you can put in front of a salon owner.
								</p>
							</div>

							<div className="flex items-center gap-3 border-primary/20 border-t pt-5">
								<span className="font-bold text-3xl text-primary tracking-tight">
									60+
								</span>
								<span className="text-[10px] text-muted-foreground uppercase leading-snug tracking-[0.18em]">
									Partner salons
									<br />
									recruiting from cohorts
								</span>
							</div>
						</CardContent>
					</Card>

					{/* ── Value cards ── */}
					<div className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
						{VALUES.map((value, index) => (
							<Card
								key={value.title}
								className="group relative gap-0 overflow-hidden border border-border py-0 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
							>
								<CardContent className="flex h-full flex-col py-7">
									<div className="flex items-start justify-between gap-4">
										<span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
											<value.icon
												className="size-5"
												stroke={1.5}
												aria-hidden="true"
											/>
										</span>
										<span className="font-mono text-[11px] text-muted-foreground/50 tracking-[0.2em]">
											{String(index + 1).padStart(2, '0')}
										</span>
									</div>

									<h3 className="mt-5 font-semibold text-base text-foreground tracking-tight">
										{value.title}
									</h3>
									<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
										{value.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
