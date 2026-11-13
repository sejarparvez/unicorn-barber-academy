import {
	IconArrowUpRight,
	IconClock,
	IconCurrencyTaka,
	IconTarget,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { ProgramNumber } from '@/components/pages/programs/program-number';
import type { Program } from '@/components/pages/programs/types';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';

export default function ProgramsList({ programs }: { programs: Program[] }) {
	return (
		<section
			aria-labelledby="programs-list-heading"
			className="section-light relative overflow-hidden border-y border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 right-0 size-[26rem] rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="programs-list-heading"
						eyebrow="The programs"
						title={
							<>
								Find the track that fits{' '}
								<span className="text-primary">your hands</span>.
							</>
						}
						description="Start with a foundation or sharpen one skill. Every track is taught on the floor, in small cohorts, with a working instructor at your shoulder."
					/>

					<Badge
						variant="outline"
						className="shrink-0 self-start border-primary/30 text-[9px] text-primary tracking-[0.18em] sm:self-auto"
					>
						{programs.length} CAREER PROGRAMS
					</Badge>
				</div>

				<div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{programs.map((program) => (
						<ProgramCard key={program.slug} program={program} />
					))}
				</div>
			</div>
		</section>
	);
}

function ProgramCard({ program }: { program: Program }) {
	return (
		<Link
			id={program.slug}
			to="/programs/$slug"
			params={{ slug: program.slug }}
			className="group block h-full scroll-mt-24 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<Card
				className={`relative h-full gap-0 border py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/5 ${
					program.featured
						? 'border-primary/25 bg-primary/[0.02] group-hover:border-primary/45'
						: 'border-border group-hover:border-primary/35'
				}`}
			>
				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
				/>

				<CardHeader className="pt-6">
					<div className="flex items-start justify-between gap-4">
						<ProgramNumber position={program.position} />

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

				<CardContent className="flex flex-1 flex-col gap-4 pt-4">
					<p className="text-muted-foreground text-sm leading-relaxed">
						{program.description}
					</p>

					<dl className="grid grid-cols-3 divide-x divide-border/60 overflow-hidden rounded-lg border border-border/70 bg-background/50">
						<ProgramMeta
							icon={IconClock}
							label="Length"
							value={program.duration}
						/>
						<ProgramMeta
							icon={IconTarget}
							label="Level"
							value={program.level}
						/>
						<ProgramMeta
							icon={IconCurrencyTaka}
							label="Tuition"
							value={`৳${program.price.toLocaleString('en-US')}`}
						/>
					</dl>

					<ul className="mt-auto flex flex-wrap gap-1.5">
						{program.highlights.map((highlight) => (
							<li key={highlight}>
								<Badge
									variant="outline"
									className="text-[9px] text-muted-foreground uppercase tracking-[0.14em]"
								>
									{highlight}
								</Badge>
							</li>
						))}
					</ul>
				</CardContent>

				<CardFooter className="mt-auto justify-between border-border/60 border-t pt-4 pb-6">
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
	);
}

function ProgramMeta({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof IconClock;
	label: string;
	value: string;
}) {
	return (
		<div className="flex flex-col items-center gap-1 px-1.5 py-2.5 text-center">
			<Icon
				className="size-3.5 text-primary/80"
				stroke={1.6}
				aria-hidden="true"
			/>
			<dt className="font-semibold text-[8px] text-muted-foreground uppercase tracking-[0.16em]">
				{label}
			</dt>
			<dd className="font-medium text-[11px] text-foreground leading-tight">
				{value}
			</dd>
		</div>
	);
}
