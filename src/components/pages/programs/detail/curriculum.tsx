import { IconBriefcase, IconCheck, IconUsers } from '@tabler/icons-react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Program } from '@/data/programs';

export default function ProgramCurriculum({ program }: { program: Program }) {
	return (
		<section
			aria-labelledby="program-curriculum-heading"
			className="section-light relative overflow-hidden border-y border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 right-0 size-[26rem] rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
					<div>
						<SectionHeading
							id="program-curriculum-heading"
							eyebrow="Curriculum"
							title={
								<>
									What you&apos;ll <span className="text-primary">cover</span>.
								</>
							}
							description={program.description}
						/>

						<ol className="mt-10 space-y-4">
							{program.curriculum.map((module, index) => (
								<li
									key={module.title}
									className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/35 hover:bg-primary/[0.02]"
								>
									<span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/5 font-semibold text-[11px] text-primary tabular-nums">
										{String(index + 1).padStart(2, '0')}
									</span>
									<div>
										<h3 className="font-semibold text-base text-foreground tracking-tight transition-colors group-hover:text-primary">
											{module.title}
										</h3>
										<p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
											{module.description}
										</p>
									</div>
								</li>
							))}
						</ol>
					</div>

					<aside className="space-y-4">
						<Card className="border border-primary/25 bg-primary/[0.04]">
							<CardContent>
								<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
									You&apos;ll leave with
								</p>
								<p className="mt-4 text-balance font-semibold text-xl text-foreground leading-tight tracking-tight">
									{program.outcome}
								</p>

								<Separator className="my-5 bg-linear-to-r from-transparent via-primary/30 to-transparent" />

								<ul className="space-y-2.5">
									{program.highlights.map((highlight) => (
										<li
											key={highlight}
											className="flex items-start gap-2.5 text-secondary-foreground/80 text-sm leading-relaxed"
										>
											<IconCheck
												className="mt-0.5 size-4 shrink-0 text-primary"
												stroke={1.8}
												aria-hidden="true"
											/>
											{highlight}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						<Card className="border border-border">
							<CardContent>
								<div className="flex items-center gap-2">
									<IconUsers
										className="size-4 text-primary"
										stroke={1.6}
										aria-hidden="true"
									/>
									<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.2em]">
										Who it&apos;s for
									</p>
								</div>

								<ul className="mt-4 space-y-3">
									{program.whoFor.map((item) => (
										<li
											key={item}
											className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed"
										>
											<span
												aria-hidden="true"
												className="mt-2 size-1 shrink-0 rounded-full bg-primary/70"
											/>
											{item}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>

						<Card className="border border-border">
							<CardContent>
								<div className="flex items-center gap-2">
									<IconBriefcase
										className="size-4 text-primary"
										stroke={1.6}
										aria-hidden="true"
									/>
									<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.2em]">
										Where it leads
									</p>
								</div>

								<ul className="mt-4 space-y-3">
									{program.careerPaths.map((path) => (
										<li
											key={path}
											className="flex items-start gap-2.5 text-muted-foreground text-sm leading-relaxed"
										>
											<span
												aria-hidden="true"
												className="mt-2 size-1 shrink-0 rounded-full bg-primary/70"
											/>
											{path}
										</li>
									))}
								</ul>
							</CardContent>
						</Card>
					</aside>
				</div>
			</div>
		</section>
	);
}
