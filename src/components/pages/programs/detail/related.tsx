import { IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { ProgramNumber } from '@/components/pages/programs/program-number';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { getProgramPosition, type Program } from '@/data/programs';

export default function RelatedPrograms({ programs }: { programs: Program[] }) {
	return (
		<section
			aria-labelledby="related-programs-heading"
			className="relative overflow-hidden border-b border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[130px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="related-programs-heading"
						eyebrow="Keep exploring"
						title={
							<>
								Other tracks on the <span className="text-primary">floor</span>.
							</>
						}
						description="Every program shares the same working floor, small cohorts and kit-included promise."
					/>

					<Link
						to="/programs"
						className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
					>
						View all programs
						<IconArrowRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-12 grid gap-4 md:grid-cols-3">
					{programs.map((program) => (
						<Link
							key={program.slug}
							to="/programs/$slug"
							params={{ slug: program.slug }}
							className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						>
							<Card className="relative h-full gap-0 border border-border py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/35 group-hover:shadow-lg group-hover:shadow-primary/5">
								<span
									aria-hidden="true"
									className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
								/>

								<CardHeader className="pt-6">
									<div className="flex items-start justify-between gap-4">
										<ProgramNumber
											position={getProgramPosition(program.slug)}
										/>
										<Badge
											variant="outline"
											className="border-primary/25 text-[9px] text-primary uppercase tracking-[0.14em]"
										>
											{program.category}
										</Badge>
									</div>

									<div className="mt-5">
										<h3 className="font-semibold text-lg text-foreground tracking-tight transition-colors group-hover:text-primary">
											{program.title}
										</h3>
										<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
											{program.tagline}
										</p>
									</div>
								</CardHeader>

								<CardContent className="flex flex-1 flex-col pt-4">
									<p className="text-muted-foreground text-sm leading-relaxed">
										{program.description}
									</p>

									<div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
										<span>{program.duration}</span>
										<span aria-hidden="true" className="text-border">
											·
										</span>
										<span>{program.level}</span>
									</div>
								</CardContent>

								<CardFooter className="mt-5 justify-between border-border/60 border-t pt-4 pb-6">
									<span className="inline-flex items-center gap-1.5 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
										View program
									</span>
									<IconArrowUpRight
										className="size-4 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
										stroke={1.75}
									/>
								</CardFooter>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
