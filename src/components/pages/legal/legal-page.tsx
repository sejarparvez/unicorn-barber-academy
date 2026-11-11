import {
	IconArrowRight,
	IconArrowUp,
	IconCalendar,
	IconCheck,
	IconChevronRight,
	IconClock,
	IconFileText,
	IconInfoCircle,
	IconList,
	IconMail,
	IconMapPin,
	IconPhone,
	IconPrinter,
	IconShieldCheck,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// These destinations are `string`-typed on purpose, matching the header and
// footer nav data: routes are added incrementally, so literal `to` values would
// fail type-checking until each page exists.
export type Destination = { label: string; to: string };

export type LegalSectionMeta = {
	id: string;
	number: string;
	title: string;
};

// TODO: replace these placeholders with the academy's real contact details
// before launch. They are intentionally centralized so every legal page (and
// eventually the footer) can share one source of truth.
export const LEGAL_CONTACT = {
	address: 'Academy address, Dhaka, Bangladesh',
	email: 'admissions@unicornbarberacademy.com',
	phone: '+880 1XXX-XXXXXX',
};

export const CONTACT_LINK: Destination = {
	label: 'Contact the academy',
	to: '/contact',
};

type LegalPageProps = {
	eyebrow?: string;
	title: string;
	titleAccent: string;
	description: string;
	lastUpdated: string;
	readingTime: string;
	meta: { label: string; value: string; icon: ReactNode }[];
	sections: readonly LegalSectionMeta[];
	summaryTitle: string;
	summaryDescription: string;
	summaryPoints: string[];
	children: ReactNode;
};

export function LegalPage({
	eyebrow = 'Legal',
	title,
	titleAccent,
	description,
	lastUpdated,
	readingTime,
	meta,
	sections,
	summaryTitle,
	summaryDescription,
	summaryPoints,
	children,
}: LegalPageProps) {
	const sectionIds = useMemo(
		() => sections.map((section) => section.id),
		[sections],
	);
	const activeSection = useActiveSection(sectionIds);

	return (
		<main id="top" className="relative">
			{/* ── Hero ─────────────────────────────────────────────────────── */}
			<section className="relative overflow-hidden border-b border-border/60">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 -z-10"
				>
					<div className="absolute -top-40 left-1/2 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.12] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]" />
				</div>

				<div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-10 lg:pt-16 lg:pb-14">
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
						<span className="text-primary">
							{title} {titleAccent}
						</span>
					</nav>

					<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
						<div>
							<div className="flex items-center gap-3">
								<span className="h-px w-8 bg-linear-to-r from-transparent to-primary/70" />
								<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
									{eyebrow}
								</span>
							</div>

							<h1 className="mt-5 max-w-2xl text-balance font-bold text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
								{title}{' '}
								<span className="bg-[linear-gradient(90deg,var(--chart-1),var(--primary),var(--chart-4))] bg-clip-text text-transparent">
									{titleAccent}
								</span>
							</h1>

							<p className="mt-5 max-w-xl text-pretty text-secondary-foreground/80 text-sm leading-relaxed sm:text-base">
								{description}
							</p>
						</div>

						<dl className="flex flex-wrap gap-x-8 gap-y-4 border-border/70 border-l pl-6 lg:flex-col lg:gap-4">
							<MetaItem
								icon={<IconCalendar className="size-4" stroke={1.75} />}
								label="Last updated"
								value={lastUpdated}
							/>
							<MetaItem
								icon={<IconClock className="size-4" stroke={1.75} />}
								label="Reading time"
								value={readingTime}
							/>
							{meta.map((item) => (
								<MetaItem
									key={item.label}
									icon={item.icon}
									label={item.label}
									value={item.value}
								/>
							))}
						</dl>
					</div>
				</div>
			</section>

			{/* ── Body ─────────────────────────────────────────────────────── */}
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
					<div className="min-w-0">
						<MobileToc sections={sections} active={activeSection} />
						<SummaryCard
							title={summaryTitle}
							description={summaryDescription}
							points={summaryPoints}
						/>

						<div className="mt-12">{children}</div>
					</div>

					{/* ── Sticky sidebar (desktop) ─────────────────────────────── */}
					<aside className="hidden lg:block print:hidden">
						<div className="sticky top-24 space-y-8">
							<DesktopToc sections={sections} active={activeSection} />

							<div className="rounded-xl border border-border/70 bg-card/40 p-5">
								<div className="flex items-center gap-2 text-primary">
									<IconFileText className="size-4" stroke={1.75} />
									<p className="font-semibold text-[11px] uppercase tracking-[0.2em]">
										Questions?
									</p>
								</div>
								<p className="mt-3 text-muted-foreground text-sm leading-relaxed">
									Need clarity on a clause? Our admissions team is happy to walk
									you through it.
								</p>
								<Link
									to={CONTACT_LINK.to}
									className="mt-4 inline-flex items-center gap-1.5 font-medium text-primary text-sm underline-offset-4 hover:underline"
								>
									{CONTACT_LINK.label}
									<IconArrowRight className="size-3.5" stroke={1.75} />
								</Link>
							</div>

							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => window.print()}
									className="flex-1 gap-2 border-border/70 text-muted-foreground hover:text-foreground"
								>
									<IconPrinter className="size-4" stroke={1.75} />
									Print
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() =>
										window.scrollTo({ top: 0, behavior: 'smooth' })
									}
									className="gap-2 text-muted-foreground hover:text-foreground"
								>
									<IconArrowUp className="size-4" stroke={1.75} />
									Top
								</Button>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</main>
	);
}

function useActiveSection(ids: readonly string[]) {
	const [active, setActive] = useState(ids[0] ?? '');

	useEffect(() => {
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null);

		if (elements.length === 0) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

				if (visible[0]) {
					setActive(visible[0].target.id);
				}
			},
			{ rootMargin: '-88px 0px -55% 0px', threshold: 0 },
		);

		for (const element of elements) {
			observer.observe(element);
		}

		return () => observer.disconnect();
	}, [ids]);

	return active;
}

function MetaItem({
	icon,
	label,
	value,
}: {
	icon: ReactNode;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-2.5">
			<span className="mt-0.5 text-primary">{icon}</span>
			<div>
				<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
					{label}
				</dt>
				<dd className="mt-0.5 text-foreground text-sm">{value}</dd>
			</div>
		</div>
	);
}

function SummaryCard({
	title,
	description,
	points,
}: {
	title: string;
	description: string;
	points: string[];
}) {
	return (
		<section
			aria-labelledby="legal-summary-title"
			className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.04] p-6 sm:p-8"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl"
			/>

			<div className="relative flex items-start gap-4">
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
					<IconShieldCheck className="size-5" stroke={1.75} />
				</span>
				<div>
					<h2
						id="legal-summary-title"
						className="font-semibold text-lg tracking-tight"
					>
						{title}
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">{description}</p>
				</div>
			</div>

			<ul className="relative mt-6 grid gap-3 sm:grid-cols-2">
				{points.map((point) => (
					<li
						key={point}
						className="flex items-start gap-2.5 text-secondary-foreground/85 text-sm leading-relaxed"
					>
						<IconCheck
							className="mt-0.5 size-4 shrink-0 text-primary"
							stroke={2}
						/>
						<span>{point}</span>
					</li>
				))}
			</ul>
		</section>
	);
}

export function LegalSection({
	section,
	children,
}: {
	section: LegalSectionMeta;
	children: ReactNode;
}) {
	return (
		<section
			id={section.id}
			className="mt-12 scroll-mt-28 border-border/50 border-t pt-12 first:mt-0 first:border-t-0 first:pt-0"
		>
			<div className="flex items-start gap-4">
				<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/5 font-semibold text-[11px] text-primary tabular-nums">
					{section.number}
				</span>
				<h2 className="font-semibold text-xl leading-snug tracking-tight sm:text-2xl">
					{section.title}
				</h2>
			</div>

			<div className="mt-4 space-y-4 text-[15px] text-secondary-foreground/85 leading-relaxed sm:pl-[3.25rem]">
				{children}
			</div>
		</section>
	);
}

export function KeyTerm({
	term,
	description,
}: {
	term: string;
	description: string;
}) {
	return (
		<li className="rounded-xl border border-border/70 bg-card/40 p-4">
			<p className="font-medium text-foreground text-sm">{term}</p>
			<p className="mt-1 text-muted-foreground text-sm leading-relaxed">
				{description}
			</p>
		</li>
	);
}

export function LegalList({ children }: { children: ReactNode }) {
	return (
		<ul className="space-y-2.5 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:top-[0.62em] [&>li]:before:left-0 [&>li]:before:size-1.5 [&>li]:before:rounded-full [&>li]:before:bg-primary/70">
			{children}
		</ul>
	);
}

export function Callout({ children }: { children: ReactNode }) {
	return (
		<div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/[0.05] px-4 py-3.5 text-secondary-foreground/90 text-sm leading-relaxed">
			<IconInfoCircle
				className="mt-0.5 size-[18px] shrink-0 text-primary"
				stroke={1.75}
			/>
			<div>{children}</div>
		</div>
	);
}

export function ContactCard({
	icon,
	label,
	value,
	href,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	href?: string;
}) {
	const content = (
		<>
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/5 text-primary">
				{icon}
			</span>
			<span className="min-w-0">
				<span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
					{label}
				</span>
				<span className="mt-1 block break-words text-foreground text-sm">
					{value}
				</span>
			</span>
		</>
	);

	return (
		<div className="rounded-xl border border-border/70 bg-card/40 p-4">
			{href ? (
				<a
					href={href}
					className="flex items-start gap-3 transition-colors hover:text-primary"
				>
					{content}
				</a>
			) : (
				<div className="flex items-start gap-3">{content}</div>
			)}
		</div>
	);
}

export function LegalContactGrid() {
	return (
		<div className="grid gap-3 sm:grid-cols-3">
			<ContactCard
				icon={<IconMapPin className="size-4" stroke={1.75} />}
				label="Visit"
				value={LEGAL_CONTACT.address}
			/>
			<ContactCard
				icon={<IconMail className="size-4" stroke={1.75} />}
				label="Email"
				value={LEGAL_CONTACT.email}
				href={`mailto:${LEGAL_CONTACT.email}`}
			/>
			<ContactCard
				icon={<IconPhone className="size-4" stroke={1.75} />}
				label="Call"
				value={LEGAL_CONTACT.phone}
				href={`tel:${LEGAL_CONTACT.phone.replace(/[^\d+]/g, '')}`}
			/>
		</div>
	);
}

export function ContactCta() {
	return (
		<Button
			nativeButton={false}
			className="glow-gold mt-2 w-full gap-2 sm:w-auto"
			render={<Link to={CONTACT_LINK.to} />}
		>
			{CONTACT_LINK.label}
			<IconArrowRight className="size-4" stroke={1.75} />
		</Button>
	);
}

function DesktopToc({
	sections,
	active,
}: {
	sections: readonly LegalSectionMeta[];
	active: string;
}) {
	return (
		<nav aria-label="On this page">
			<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.24em]">
				On this page
			</p>
			<ul className="mt-4 space-y-0.5 border-border/70 border-l">
				{sections.map((section) => (
					<li key={section.id}>
						<a
							href={`#${section.id}`}
							aria-current={active === section.id ? 'location' : undefined}
							className={cn(
								'-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors',
								active === section.id
									? 'border-primary font-medium text-primary'
									: 'border-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
							)}
						>
							<span className="mr-2 text-[11px] text-muted-foreground/70 tabular-nums">
								{section.number}
							</span>
							{section.title}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

function MobileToc({
	sections,
	active,
}: {
	sections: readonly LegalSectionMeta[];
	active: string;
}) {
	return (
		<details className="group mb-8 rounded-xl border border-border/70 bg-card/40 lg:hidden print:hidden">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
				<span className="flex items-center gap-2.5 font-medium text-foreground text-sm">
					<IconList className="size-4 text-primary" stroke={1.75} />
					On this page
				</span>
				<IconChevronRight
					className="size-4 text-muted-foreground transition-transform group-open:rotate-90"
					stroke={1.75}
				/>
			</summary>

			<nav
				aria-label="On this page"
				className="border-border/60 border-t px-2 py-2"
			>
				<ul className="grid gap-0.5">
					{sections.map((section) => (
						<li key={section.id}>
							<a
								href={`#${section.id}`}
								aria-current={active === section.id ? 'location' : undefined}
								className={cn(
									'flex items-baseline gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
									active === section.id
										? 'bg-primary/10 text-primary'
										: 'text-muted-foreground hover:bg-primary/5 hover:text-foreground',
								)}
							>
								<span className="text-[11px] text-muted-foreground/70 tabular-nums">
									{section.number}
								</span>
								{section.title}
							</a>
						</li>
					))}
				</ul>
			</nav>
		</details>
	);
}
