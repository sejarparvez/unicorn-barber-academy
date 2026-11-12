import {
	IconArrowRight,
	IconChevronRight,
	IconQuote,
	IconSchool,
	IconScissors,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { INSTRUCTORS } from '@/data/instructors';
import { cn, getInitials } from '@/lib/utils';

// Destinations are `string`-typed on purpose: routes are added incrementally,
// so literal paths would fail type-checking until each page exists.
const VISIT_LINK: { label: string; to: string } = {
	label: 'Book a campus visit',
	to: '/contact',
};

const FACTS = [
	{ icon: IconScissors, label: 'Barbering, beauty & makeup' },
	{ icon: IconUsers, label: 'Capped at 8 per instructor' },
	{ icon: IconSchool, label: 'Working professionals, not lecturers' },
];

const combinedYears = INSTRUCTORS.reduce(
	(total, instructor) => total + instructor.years,
	0,
);

const FACULTY_STATS = [
	{
		value: String(INSTRUCTORS.length).padStart(2, '0'),
		label: 'Working instructors',
	},
	{ value: '1:8', label: 'Instructor ratio' },
	{ value: `${combinedYears}+`, label: 'Years on the floor' },
];

export default function InstructorsHero() {
	const featured = INSTRUCTORS[0];

	return (
		<section
			aria-labelledby="instructors-hero-heading"
			className="relative overflow-hidden bg-background"
		>
			{/* Quiet gold haze and a faint blueprint grid — no imagery, just type. */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10"
			>
				<div className="absolute -top-48 left-1/3 size-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
				<div className="absolute top-1/3 right-0 size-[24rem] rounded-full bg-primary/5 blur-[120px]" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.1] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_65%)]" />
			</div>

			<div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-10 lg:pt-16 lg:pb-20">
				<div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
					<div>
						<nav
							aria-label="Breadcrumb"
							className="flex items-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.22em]"
						>
							<Link to="/" className="transition-colors hover:text-primary">
								Home
							</Link>
							<IconChevronRight
								className="size-3 text-muted-foreground/60"
								stroke={1.75}
							/>
							<span className="text-primary">Instructors</span>
						</nav>

						<div className="mt-10 flex items-center gap-3">
							<span
								aria-hidden="true"
								className="h-px w-8 bg-linear-to-r from-transparent to-primary/70"
							/>
							<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
								The faculty
							</span>
						</div>

						<h1
							id="instructors-hero-heading"
							className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 mt-6 text-balance font-semibold text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.03] tracking-tight"
							style={{ fontFamily: 'var(--font-heading)' }}
						>
							Learn from people who still{' '}
							<span className="text-primary">hold the clippers</span>.
						</h1>

						<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-6 max-w-xl text-pretty text-[17px] text-foreground/70 leading-relaxed sm:text-lg">
							Not career lecturers. Every instructor on this floor still takes
							clients, still trains and still knows what it feels like to be
							corrected mid-cut.
						</p>

						<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
							<a
								href="#faculty"
								className={cn(
									buttonVariants({ variant: 'default' }),
									'glow-gold justify-center px-7 py-6 font-semibold text-[12px] tracking-[0.16em]',
								)}
							>
								MEET THE FACULTY
								<IconArrowRight className="size-4" stroke={1.75} />
							</a>

							<Link
								to={VISIT_LINK.to}
								className="group inline-flex items-center gap-1.5 font-semibold text-[11px] text-foreground/70 uppercase tracking-[0.16em] transition-colors hover:text-primary"
							>
								{VISIT_LINK.label}
								<IconArrowRight
									className="size-3.5 transition-transform group-hover:translate-x-0.5"
									stroke={1.75}
								/>
							</Link>
						</div>
					</div>

					{/* Faculty overview — a single card that gives the roster a face. */}
					<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur sm:p-6">
						<span
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
						/>

						<div className="flex items-center justify-between gap-4">
							<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
								Faculty at a glance
							</p>
							<IconScissors
								className="size-4 text-primary/60"
								stroke={1.5}
								aria-hidden="true"
							/>
						</div>

						<figure className="mt-6">
							<IconQuote
								className="size-7 text-primary/40"
								stroke={1.5}
								aria-hidden="true"
							/>
							<blockquote className="mt-3 text-pretty text-foreground/85 text-lg leading-snug tracking-tight">
								&ldquo;{featured.quote}&rdquo;
							</blockquote>
							<figcaption className="mt-4 flex items-center gap-3">
								<Avatar
									size="lg"
									className="border border-primary/30 bg-primary/10"
								>
									<AvatarFallback className="bg-primary/10 font-semibold text-primary text-xs">
										{getInitials(featured.name)}
									</AvatarFallback>
								</Avatar>
								<span className="min-w-0">
									<span className="block truncate font-semibold text-foreground text-sm">
										{featured.name}
									</span>
									<span className="mt-0.5 block truncate text-muted-foreground text-xs">
										{featured.role}
									</span>
								</span>
							</figcaption>
						</figure>

						<Separator className="my-6 bg-border/60" />

						<dl className="grid grid-cols-3 divide-x divide-border/60">
							{FACULTY_STATS.map((stat) => (
								<div
									key={stat.label}
									className="flex flex-col items-center gap-1 px-2 text-center"
								>
									<dd className="font-bold text-xl text-primary tracking-tight sm:text-2xl">
										{stat.value}
									</dd>
									<dt className="font-semibold text-[8px] text-muted-foreground uppercase leading-snug tracking-[0.16em]">
										{stat.label}
									</dt>
								</div>
							))}
						</dl>

						<div className="mt-6 flex items-center gap-3 border-border/60 border-t pt-5">
							<AvatarGroup>
								{INSTRUCTORS.map((instructor) => (
									<Avatar
										key={instructor.slug}
										size="sm"
										className="size-8"
										title={instructor.name}
									>
										<AvatarFallback className="bg-primary/10 font-semibold text-[9px] text-primary">
											{getInitials(instructor.name)}
										</AvatarFallback>
									</Avatar>
								))}
							</AvatarGroup>
							<p className="text-muted-foreground text-xs leading-relaxed">
								One floor, one standard: you leave ready for the chair.
							</p>
						</div>
					</div>
				</div>

				<Separator className="mt-14 bg-linear-to-r from-transparent via-border to-transparent" />

				<ul className="motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200 mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
					{FACTS.map((fact) => (
						<li
							key={fact.label}
							className="flex items-center gap-2 text-muted-foreground text-xs"
						>
							<fact.icon
								className="size-4 text-primary"
								stroke={1.6}
								aria-hidden="true"
							/>
							{fact.label}
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
