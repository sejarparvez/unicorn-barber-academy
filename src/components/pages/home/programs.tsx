import { IconArrowRight, IconArrowUpRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { ProgramNumber } from '@/components/pages/programs/program-number';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import { SectionHeading } from './section-heading';

type Program = {
	title: string;
	description: string;
	meta: string[];
	to: string;
};

// `to` is `string`-typed on purpose: the individual program routes are added
// incrementally, so literal paths would fail type-checking until they exist.
const FEATURED: Program[] = [
	{
		title: 'Classic Barbering',
		description:
			'Foundations, fades, tapers and classic cuts — the full barbering toolkit from first grip to final blend.',
		meta: ['Beginner friendly', 'Hands-on', 'Certificate'],
		to: '/programs/classic-barbering',
	},
	{
		title: 'Fades & Tapers',
		description:
			'Precision fade work, taper blending and sharp line-ups, drilled until the transitions disappear.',
		meta: ['Intermediate', 'Practical', 'Certificate'],
		to: '/programs/fades-and-tapers',
	},
	{
		title: 'Beard Sculpting',
		description:
			'Shape, line and finish beards with clipper work, razor detailing and hot-towel treatments.',
		meta: ['All levels', 'Practical', 'Certificate'],
		to: '/programs/beard-sculpting',
	},
];

const ALSO_OFFERED: Program[] = [
	{
		title: 'Cosmetology Fundamentals',
		description: 'Skin, hair and beauty science for the salon floor.',
		meta: [],
		to: '/programs/cosmetology-fundamentals',
	},
	{
		title: 'Hair Styling & Colouring',
		description: 'Cutting, colour theory and modern styling.',
		meta: [],
		to: '/programs/hair-styling-and-colouring',
	},
	{
		title: 'Bridal & Editorial Makeup',
		description: 'Client-ready looks for weddings and shoots.',
		meta: [],
		to: '/programs/bridal-and-editorial-makeup',
	},
];

const ALL_PROGRAMS = { label: 'View all programs', to: '/programs' };

export default function Programs() {
	return (
		<section
			aria-labelledby="programs-heading"
			className="section-light relative overflow-hidden bg-background px-4 py-24 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-32 right-0 size-[26rem] rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="programs-heading"
						eyebrow="Programs"
						title={
							<>
								Pick the craft.{' '}
								<span className="text-primary">We&apos;ll teach the rest.</span>
							</>
						}
						description="Career-focused programs built around the tools, techniques and client work you will meet on day one."
					/>

					<Link
						to={ALL_PROGRAMS.to}
						className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
					>
						{ALL_PROGRAMS.label}
						<IconArrowRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid gap-5 md:grid-cols-3">
					{FEATURED.map((program, index) => (
						<ProgramCard key={program.title} program={program} index={index} />
					))}
				</div>

				<div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/60 md:grid-cols-3">
					{ALSO_OFFERED.map((program, index) => (
						<Link
							key={program.title}
							to={program.to}
							className="group flex items-start gap-4 bg-card/40 p-5 transition-colors hover:bg-primary/5"
						>
							<ProgramNumber position={FEATURED.length + index + 1} size="sm" />
							<span className="min-w-0">
								<span className="flex items-center gap-1.5 font-medium text-foreground text-sm transition-colors group-hover:text-primary">
									{program.title}
									<IconArrowUpRight
										className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
										stroke={1.75}
									/>
								</span>
								<span className="mt-1 block text-muted-foreground text-xs leading-relaxed">
									{program.description}
								</span>
							</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}

function ProgramCard({ program, index }: { program: Program; index: number }) {
	return (
		<Link
			to={program.to}
			className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			<Card className="relative h-full gap-0 py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-primary/40 group-hover:shadow-lg group-hover:shadow-primary/5">
				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
				/>

				<CardHeader className="pt-6">
					<div className="flex items-start justify-between gap-4">
						<ProgramNumber position={index + 1} />
					</div>

					<h3 className="mt-5 font-semibold text-lg tracking-tight transition-colors group-hover:text-primary">
						{program.title}
					</h3>
				</CardHeader>

				<CardContent className="flex flex-1 flex-col gap-4 pt-4">
					<p className="flex-1 text-muted-foreground text-sm leading-relaxed">
						{program.description}
					</p>

					<ul className="flex flex-wrap gap-1.5">
						{program.meta.map((item) => (
							<li key={item}>
								<Badge
									variant="outline"
									className="text-[10px] text-muted-foreground uppercase tracking-[0.14em]"
								>
									{item}
								</Badge>
							</li>
						))}
					</ul>
				</CardContent>

				<CardFooter className="pt-6 pb-6">
					<span className="inline-flex items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em]">
						Explore program
						<IconArrowUpRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
							stroke={1.75}
						/>
					</span>
				</CardFooter>
			</Card>
		</Link>
	);
}
