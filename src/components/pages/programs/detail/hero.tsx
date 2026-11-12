import {
	IconArrowRight,
	IconCalendarEvent,
	IconCertificate,
	IconChevronRight,
	IconClock,
	IconCurrencyTaka,
	IconScissors,
	IconTarget,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import {
	formatProgramNumber,
	ProgramNumber,
} from '@/components/pages/programs/program-number';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getProgramPosition, type Program } from '@/data/programs';

const ENROLL_LINK: { label: string; to: string } = {
	label: 'Enroll now',
	to: '/enroll',
};

const CONTACT_LINK: { label: string; to: string } = {
	label: 'Talk to admissions',
	to: '/contact',
};

function formatPrice(amount: number) {
	return `৳${amount.toLocaleString('en-US')}`;
}

export default function ProgramDetailHero({ program }: { program: Program }) {
	const position = getProgramPosition(program.slug);

	return (
		<section
			aria-labelledby="program-detail-heading"
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

			<div className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-10 lg:pt-14 lg:pb-20">
				<nav
					aria-label="Breadcrumb"
					className="flex min-w-0 items-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.22em]"
				>
					<Link
						to="/"
						className="shrink-0 transition-colors hover:text-primary"
					>
						Home
					</Link>
					<IconChevronRight
						className="size-3 shrink-0 text-muted-foreground/60"
						stroke={1.75}
					/>
					<Link
						to="/programs"
						className="shrink-0 transition-colors hover:text-primary"
					>
						Programs
					</Link>
					<IconChevronRight
						className="size-3 shrink-0 text-muted-foreground/60"
						stroke={1.75}
					/>
					<span className="truncate text-primary">{program.title}</span>
				</nav>

				<div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start lg:gap-16">
					<div>
						<div className="flex flex-wrap items-center gap-4">
							<ProgramNumber position={position} size="xl" />
							<div className="flex flex-col gap-1.5">
								<Badge
									variant="outline"
									className="w-fit border-primary/30 text-[9px] text-primary uppercase tracking-[0.16em]"
								>
									{program.category}
								</Badge>
								<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
									{program.level} · {program.duration}
								</span>
							</div>
						</div>

						<h1
							id="program-detail-heading"
							className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 mt-6 text-balance font-semibold text-[clamp(2.5rem,6vw,4.25rem)] leading-[1.03] tracking-tight"
							style={{ fontFamily: 'var(--font-heading)' }}
						>
							{program.title}
						</h1>

						<p className="mt-4 text-balance font-medium text-lg text-primary tracking-tight sm:text-xl">
							{program.tagline}
						</p>

						<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-4 max-w-xl text-pretty text-[17px] text-foreground/70 leading-relaxed sm:text-lg">
							{program.description}
						</p>

						<ul className="mt-6 flex flex-wrap gap-1.5">
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

						<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button
								nativeButton={false}
								size="lg"
								className="glow-gold h-11 gap-2 px-6 font-semibold text-[12px] tracking-[0.16em]"
								render={<Link to={ENROLL_LINK.to} />}
							>
								{ENROLL_LINK.label.toUpperCase()}
								<IconArrowRight className="size-4" stroke={1.75} />
							</Button>

							<Button
								nativeButton={false}
								variant="outline"
								size="lg"
								className="h-11 gap-2 border-primary/30 px-6 font-semibold text-[12px] text-primary tracking-[0.16em] hover:bg-primary/10 hover:text-primary"
								render={<Link to={CONTACT_LINK.to} />}
							>
								{CONTACT_LINK.label.toUpperCase()}
							</Button>
						</div>
					</div>

					{/* ── At a glance ── */}
					<aside className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 relative overflow-hidden rounded-2xl border border-primary/25 bg-card p-6 shadow-sm sm:p-7">
						<span
							aria-hidden="true"
							className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
						/>
						<div
							aria-hidden="true"
							className="pointer-events-none absolute -right-8 -bottom-10 font-bold font-mono text-[11rem] text-primary/[0.05] leading-none -rotate-12 select-none"
						>
							{formatProgramNumber(position)}
						</div>

						<div className="relative">
							<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
								At a glance
							</p>

							<dl className="mt-4 divide-y divide-border/60">
								<DetailRow
									icon={IconCurrencyTaka}
									label="Tuition"
									value={formatPrice(program.price)}
								/>
								<DetailRow
									icon={IconClock}
									label="Duration"
									value={program.duration}
								/>
								<DetailRow
									icon={IconTarget}
									label="Level"
									value={program.level}
								/>
								<DetailRow
									icon={IconCalendarEvent}
									label="Schedule"
									value={program.schedule}
								/>
								<DetailRow
									icon={IconCertificate}
									label="Certificate"
									value="NTVQF recognised"
								/>
								<DetailRow
									icon={IconScissors}
									label="Kit"
									value="Full kit included"
								/>
								<DetailRow
									icon={IconUsers}
									label="Class size"
									value="Small, capped cohorts"
								/>
							</dl>

							<Separator className="my-5 bg-linear-to-r from-transparent via-border to-transparent" />

							<div className="flex flex-col gap-2.5">
								<Button
									nativeButton={false}
									size="lg"
									className="glow-gold h-11 w-full gap-2 font-semibold text-[12px] tracking-[0.16em]"
									render={<Link to={ENROLL_LINK.to} />}
								>
									{ENROLL_LINK.label.toUpperCase()}
									<IconArrowRight className="size-4" stroke={1.75} />
								</Button>
								<Button
									nativeButton={false}
									variant="outline"
									size="lg"
									className="h-11 w-full gap-2 border-primary/30 font-semibold text-[11px] text-primary tracking-[0.16em] hover:bg-primary/10 hover:text-primary"
									render={<Link to={CONTACT_LINK.to} />}
								>
									{CONTACT_LINK.label.toUpperCase()}
								</Button>
							</div>

							<p className="mt-4 text-center font-medium text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
								Day &amp; evening cohorts · Payment plans available
							</p>
						</div>
					</aside>
				</div>
			</div>
		</section>
	);
}

function DetailRow({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof IconClock;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-center gap-3 py-3">
			<Icon
				className="size-4 shrink-0 text-primary/80"
				stroke={1.6}
				aria-hidden="true"
			/>
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="ml-auto text-right font-medium text-foreground text-xs">
				{value}
			</dd>
		</div>
	);
}
