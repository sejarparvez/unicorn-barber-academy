import {
	IconArrowRight,
	IconChevronRight,
	IconClock,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { ProgramNumber } from '@/components/pages/programs/program-number';
import type { Program } from '@/components/pages/programs/types';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Destinations are `string`-typed on purpose: routes are added incrementally,
// so literal paths would fail type-checking until each page exists.
const ENROLL_LINK: { label: string; to: string } = {
	label: 'Enroll now',
	to: '/enroll',
};

const CONTACT_LINK: { label: string; to: string } = {
	label: 'Talk to admissions',
	to: '/contact',
};

function programStats(count: number) {
	return [
		{ value: String(count), label: 'Career programs' },
		{ value: '60+', label: 'Hiring partners' },
		{ value: '2', label: 'Cohort times' },
		{ value: '100%', label: 'Hands-on' },
	];
}

export default function ProgramsHero({ programs }: { programs: Program[] }) {
	return (
		<section
			aria-labelledby="programs-hero-heading"
			className="relative overflow-hidden bg-background"
		>
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
							<span className="text-primary">Programs</span>
						</nav>

						<div className="mt-10 flex items-center gap-3">
							<span
								aria-hidden="true"
								className="h-px w-8 bg-linear-to-r from-transparent to-primary/70"
							/>
							<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
								Programs & curriculum
							</span>
						</div>

						<h1
							id="programs-hero-heading"
							className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 mt-6 text-balance font-semibold text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.03] tracking-tight"
							style={{ fontFamily: 'var(--font-heading)' }}
						>
							Choose the <span className="text-primary">craft</span>.
							<br className="hidden sm:block" /> We&apos;ll teach the rest.
						</h1>

						<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-6 max-w-xl text-pretty text-[17px] text-foreground/70 leading-relaxed sm:text-lg">
							{programs.length} career programs, one working floor. Every course
							is built around real tools, chair time and the clients you will
							meet on day one — not a slideshow.
						</p>

						<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
							<Link
								to={ENROLL_LINK.to}
								className={cn(
									buttonVariants({ variant: 'default' }),
									'glow-gold justify-center px-7 py-6 font-semibold text-[12px] tracking-[0.16em]',
								)}
							>
								{ENROLL_LINK.label.toUpperCase()}
								<IconArrowRight className="size-4" stroke={1.75} />
							</Link>

							<Link
								to={CONTACT_LINK.to}
								className="group inline-flex items-center gap-1.5 font-semibold text-[11px] text-foreground/70 uppercase tracking-[0.16em] transition-colors hover:text-primary"
							>
								{CONTACT_LINK.label}
								<IconArrowRight
									className="size-3.5 transition-transform group-hover:translate-x-0.5"
									stroke={1.75}
								/>
							</Link>
						</div>
					</div>

					{/* Quick jump panel — keeps the six programs within one scroll of the hero. */}
					<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-sm backdrop-blur sm:p-6">
						<span
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
						/>

						<div className="flex items-center justify-between gap-4">
							<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
								Jump to a program
							</p>
							<span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.18em]">
								<IconClock className="size-3.5" stroke={1.6} />
								{programs.length} tracks
							</span>
						</div>

						<ul className="mt-3 divide-y divide-border/60">
							{programs.map((program) => (
								<li key={program.slug}>
									<a
										href={`#${program.slug}`}
										className="group flex items-center gap-3 py-3"
									>
										<ProgramNumber position={program.position} size="sm" />
										<span className="min-w-0 flex-1">
											<span className="block truncate font-medium text-foreground text-sm transition-colors group-hover:text-primary">
												{program.title}
											</span>
											<span className="mt-0.5 block font-medium text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
												{program.category} · {program.duration}
											</span>
										</span>
										<IconArrowRight
											className="size-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
											stroke={1.75}
										/>
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				<Separator className="mt-14 bg-linear-to-r from-transparent via-border to-transparent" />

				<dl className="motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200 mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
					{programStats(programs.length).map((stat) => (
						<div key={stat.label} className="flex flex-col gap-1">
							<dt className="order-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
								{stat.label}
							</dt>
							<dd className="order-1 font-bold text-3xl text-primary tracking-tight">
								{stat.value}
							</dd>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
