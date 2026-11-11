import { IconChevronRight, IconHome, IconScissors } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

// These destinations are `string`-typed on purpose, matching the header/footer
// nav data: the routes are added incrementally, so literal `to` values would
// fail type-checking until each page exists.
type Destination = { label: string; to: string };

const PROGRAMS: Destination = { label: 'Explore Programs', to: '/programs' };

const QUICK_LINKS: Destination[] = [
	{ label: 'Programs', to: '/programs' },
	{ label: 'Instructors', to: '/instructors' },
	{ label: 'About', to: '/about' },
	{ label: 'Contact', to: '/contact' },
];

const CONTACT: Destination = {
	label: 'Contact the academy',
	to: '/contact',
};

export default function NotFoundPage() {
	return (
		<section
			aria-labelledby="not-found-title"
			className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-20 sm:px-6"
		>
			{/* ── Backdrop: gold haze, blueprint grid, ghosted 404 ── */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 -z-10"
			>
				<div className="absolute top-1/2 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-20 [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
				<span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-black text-[clamp(7rem,28vw,20rem)] text-primary/5 leading-none tracking-tighter select-none">
					404
				</span>
			</div>

			<div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
				{/* Eyebrow with tapering gold rules */}
				<div className="flex items-center gap-4">
					<span className="h-px w-10 bg-linear-to-r from-transparent to-primary/70 sm:w-16" />
					<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.35em]">
						Error 404
					</span>
					<span className="h-px w-10 bg-linear-to-l from-transparent to-primary/70 sm:w-16" />
				</div>

				{/* Barber's mark */}
				<div className="relative mt-8">
					<div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
					<div className="relative flex size-16 items-center justify-center rounded-full border border-primary/30 bg-background/80 shadow-inner">
						<IconScissors
							className="size-7 -rotate-45 text-primary"
							stroke={1.5}
						/>
					</div>
				</div>

				<h1
					id="not-found-title"
					className="mt-8 font-bold text-4xl text-balance leading-[1.05] tracking-tight sm:text-5xl md:text-6xl"
				>
					This page has left the{' '}
					<span className="bg-[linear-gradient(90deg,var(--chart-1),var(--primary),var(--chart-4))] bg-clip-text text-transparent">
						chair
					</span>
					.
				</h1>

				<p className="mt-5 max-w-md text-pretty text-secondary-foreground/80 text-sm leading-relaxed sm:text-base">
					The link may be broken, or the page packed up its clippers and moved
					on. Let&apos;s get you back to the shop floor.
				</p>

				{/* Primary actions */}
				<div className="mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
					<Button
						nativeButton={false}
						size="lg"
						className="glow-gold w-full gap-2 rounded-md px-6 sm:w-auto"
						render={<Link to="/" />}
					>
						<IconHome className="size-4" stroke={1.75} />
						Back to Home
					</Button>
					<Button
						nativeButton={false}
						variant="outline"
						size="lg"
						className="w-full gap-2 rounded-md border-primary/30 px-6 text-primary hover:bg-primary/10 hover:text-primary sm:w-auto"
						render={<Link to={PROGRAMS.to} />}
					>
						{PROGRAMS.label}
						<IconChevronRight className="size-4" stroke={1.75} />
					</Button>
				</div>

				{/* Divider */}
				<div className="mt-12 flex w-full items-center gap-4">
					<span className="h-px flex-1 bg-linear-to-r from-transparent to-border" />
					<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.28em]">
						Popular destinations
					</span>
					<span className="h-px flex-1 bg-linear-to-l from-transparent to-border" />
				</div>

				{/* Quick links */}
				<nav aria-label="Popular destinations" className="mt-5">
					<ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
						{QUICK_LINKS.map((link) => (
							<li key={link.to}>
								<Link
									to={link.to}
									preload="intent"
									className="group inline-flex items-center gap-1 font-medium text-secondary-foreground/70 text-sm transition-colors hover:text-primary"
								>
									{link.label}
									<IconChevronRight
										className="size-3.5 transition-transform group-hover:translate-x-0.5"
										stroke={1.75}
									/>
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<p className="mt-10 text-muted-foreground text-xs">
					Still stuck?{' '}
					<Link
						to={CONTACT.to}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						{CONTACT.label}
					</Link>{' '}
					and we&apos;ll point you in the right direction.
				</p>
			</div>
		</section>
	);
}
