import {
	IconArrowRight,
	IconChevronRight,
	IconClock,
	IconMapPin,
	IconScissors,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Destinations are `string`-typed on purpose: routes are added incrementally,
// so literal paths would fail type-checking until each page exists.
const PROGRAMS_LINK: { label: string; to: string } = {
	label: 'Explore programs',
	to: '/programs',
};

const CONTACT_LINK: { label: string; to: string } = {
	label: 'Talk to admissions',
	to: '/contact',
};

const FACTS = [
	{ icon: IconMapPin, label: 'Banasree, Dhaka' },
	{ icon: IconClock, label: 'Day & evening cohorts' },
	{ icon: IconScissors, label: '6 career programs' },
];

export default function AboutHero() {
	return (
		<section
			aria-labelledby="about-hero-heading"
			className="relative overflow-hidden bg-background"
		>
			{/* Quiet gold haze and a faint blueprint grid — no imagery, just type. */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10"
			>
				<div className="absolute -top-48 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.1] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_5%,transparent_65%)]" />
			</div>

			<div className="mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 lg:pt-16 lg:pb-20">
				<nav
					aria-label="Breadcrumb"
					className="flex items-center justify-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.22em]"
				>
					<Link to="/" className="transition-colors hover:text-primary">
						Home
					</Link>
					<IconChevronRight
						className="size-3 text-muted-foreground/60"
						stroke={1.75}
					/>
					<span className="text-primary">About</span>
				</nav>

				<div className="mt-10 flex items-center justify-center gap-3">
					<span
						aria-hidden="true"
						className="h-px w-8 bg-linear-to-r from-transparent to-primary/70"
					/>
					<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
						About the academy
					</span>
					<span
						aria-hidden="true"
						className="h-px w-8 bg-linear-to-l from-transparent to-primary/70"
					/>
				</div>

				<h1
					id="about-hero-heading"
					className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 mt-6 text-balance font-semibold text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.02] tracking-tight"
					style={{ fontFamily: 'var(--font-heading)' }}
				>
					Learn the craft
					<br className="hidden sm:block" /> where it{' '}
					<span className="text-primary">happens</span>.
				</h1>

				<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mx-auto mt-6 max-w-2xl text-pretty text-[17px] text-foreground/70 leading-relaxed sm:text-lg">
					Unicorn is a hands-on barbering, styling and makeup academy in
					Banasree, Dhaka — built around real tools, working instructors and
					chair time from day one.
				</p>

				<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link
						to={PROGRAMS_LINK.to}
						className={cn(
							buttonVariants({ variant: 'default' }),
							'glow-gold justify-center px-7 py-6 font-semibold text-[12px] tracking-[0.16em]',
						)}
					>
						{PROGRAMS_LINK.label.toUpperCase()}
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

				<Separator className="mx-auto mt-12 max-w-2xl bg-linear-to-r from-transparent via-border to-transparent" />

				<ul className="motion-safe:animate-in motion-safe:fade-in motion-safe:delay-200 mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
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
