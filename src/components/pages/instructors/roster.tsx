import {
	IconArrowRight,
	IconArrowUpRight,
	IconCertificate,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from '@/components/ui/card';
import {
	INSTRUCTOR_FILTERS,
	INSTRUCTORS,
	type Instructor,
	type InstructorFilter,
} from '@/data/instructors';
import { getProgramBySlug } from '@/data/programs';
import { cn, getInitials } from '@/lib/utils';

const CONTACT_LINK: { label: string; to: string } = {
	label: 'Ask admissions',
	to: '/contact',
};

function countFor(filter: InstructorFilter) {
	return filter === 'All'
		? INSTRUCTORS.length
		: INSTRUCTORS.filter((instructor) => instructor.department === filter)
				.length;
}

export default function InstructorsRoster() {
	const [activeFilter, setActiveFilter] = useState<InstructorFilter>('All');

	const visibleInstructors =
		activeFilter === 'All'
			? INSTRUCTORS
			: INSTRUCTORS.filter(
					(instructor) => instructor.department === activeFilter,
				);

	return (
		<section
			id="faculty"
			aria-labelledby="faculty-heading"
			className="section-light relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 right-0 size-[26rem] rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="faculty-heading"
						eyebrow="The people behind the chair"
						title={
							<>
								A working instructor at your{' '}
								<span className="text-primary">shoulder</span>.
							</>
						}
						description="Every instructor still works the floor. They bring the current shop into class — the same tools, the same clients, the same standard you will be held to."
					/>

					<Badge
						variant="outline"
						className="shrink-0 self-start border-primary/30 text-[9px] text-primary tracking-[0.18em] sm:self-auto"
					>
						{INSTRUCTORS.length} INSTRUCTORS
					</Badge>
				</div>

				<div className="mt-10 flex flex-col gap-4 border-border/60 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
					<fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
						<legend className="sr-only">Filter faculty by department</legend>
						{INSTRUCTOR_FILTERS.map((filter) => {
							const active = activeFilter === filter;

							return (
								<button
									key={filter}
									type="button"
									onClick={() => setActiveFilter(filter)}
									aria-pressed={active}
									className={cn(
										'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-semibold text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
										active
											? 'border-primary bg-primary text-primary-foreground'
											: 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary',
									)}
								>
									{filter}
									<span
										className={cn(
											'rounded-full px-1.5 py-0.5 font-mono text-[9px]',
											active
												? 'bg-primary-foreground/15 text-primary-foreground'
												: 'bg-muted text-muted-foreground',
										)}
									>
										{countFor(filter)}
									</span>
								</button>
							);
						})}
					</fieldset>

					<p
						aria-live="polite"
						className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]"
					>
						Showing {visibleInstructors.length} of {INSTRUCTORS.length}
					</p>
				</div>

				<div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
					{visibleInstructors.map((instructor) => (
						<InstructorCard key={instructor.slug} instructor={instructor} />
					))}
				</div>

				<div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-xl border border-border/70 bg-card/50 px-5 py-4 sm:flex-row sm:items-center">
					<p className="text-pretty text-muted-foreground text-sm leading-relaxed">
						Want to know who teaches a specific module? Admissions can tell you
						exactly who is on the floor for your cohort.
					</p>
					<Link
						to={CONTACT_LINK.to}
						className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]"
					>
						{CONTACT_LINK.label}
						<IconArrowRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5"
							stroke={1.75}
						/>
					</Link>
				</div>
			</div>
		</section>
	);
}

function InstructorCard({ instructor }: { instructor: Instructor }) {
	const programs = instructor.programSlugs
		.map((slug) => getProgramBySlug(slug))
		.filter((program) => program !== undefined);

	return (
		<Card className="group/faculty relative h-full gap-0 overflow-hidden border border-border py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5">
			<span
				aria-hidden="true"
				className="absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity group-hover/faculty:opacity-100"
			/>

			{/* Monogram plate — stands in for a portrait until real faculty photos land. */}
			<div className="relative h-44 overflow-hidden border-border/60 border-b bg-secondary/40">
				<div
					aria-hidden="true"
					className="absolute inset-0 opacity-[0.14]"
					style={{
						backgroundImage:
							'repeating-linear-gradient(135deg, var(--primary) 0 1px, transparent 1px 16px)',
					}}
				/>
				<div
					aria-hidden="true"
					className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-transparent"
				/>
				<div
					aria-hidden="true"
					className="absolute -right-12 -bottom-16 size-48 rounded-full border border-primary/20"
				/>
				<div
					aria-hidden="true"
					className="absolute -right-3 -bottom-8 size-28 rounded-full border border-primary/15"
				/>

				<div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3">
					<Badge
						variant="outline"
						className="border-primary/25 bg-background/75 text-[9px] text-primary uppercase tracking-[0.14em] backdrop-blur"
					>
						{instructor.department}
					</Badge>
					<span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.18em]">
						{instructor.years} yrs
					</span>
				</div>

				<span
					aria-hidden="true"
					className="absolute -bottom-5 left-4 select-none font-bold text-7xl text-primary/15 leading-none tracking-tighter transition-colors group-hover/faculty:text-primary/25"
				>
					{getInitials(instructor.name)}
				</span>

				<span className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-background/70 text-primary backdrop-blur">
					<instructor.icon className="size-5" stroke={1.5} aria-hidden="true" />
				</span>
			</div>

			<CardHeader className="gap-0 pt-5">
				<h3 className="font-semibold text-lg text-foreground tracking-tight transition-colors group-hover/faculty:text-primary">
					{instructor.name}
				</h3>
				<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
					{instructor.role}
				</p>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col gap-4 pt-4">
				<p className="text-secondary-foreground/80 text-sm leading-relaxed">
					{instructor.bio}
				</p>

				<figure className="border-primary/30 border-l pl-3">
					<blockquote className="text-pretty text-[13px] text-foreground/60 italic leading-relaxed">
						&ldquo;{instructor.quote}&rdquo;
					</blockquote>
				</figure>

				<ul className="mt-auto flex flex-wrap gap-1.5">
					{instructor.specialties.map((specialty) => (
						<li key={specialty}>
							<Badge
								variant="outline"
								className="text-[9px] text-muted-foreground uppercase tracking-[0.14em]"
							>
								{specialty}
							</Badge>
						</li>
					))}
				</ul>
			</CardContent>

			<CardFooter className="mt-auto flex-col items-start gap-3 border-border/60 border-t pt-4 pb-6">
				<p className="flex items-center gap-1.5 font-semibold text-[9px] text-muted-foreground uppercase tracking-[0.16em]">
					<IconCertificate
						className="size-3.5 text-primary/70"
						stroke={1.75}
						aria-hidden="true"
					/>
					{instructor.credential}
				</p>

				<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
					<span className="font-semibold text-[9px] text-primary uppercase tracking-[0.16em]">
						{programs.length > 0 ? 'Teaches' : 'Supports'}
					</span>
					{programs.length > 0 ? (
						programs.map((program) => (
							<Link
								key={program.slug}
								to="/programs/$slug"
								params={{ slug: program.slug }}
								className="group/program inline-flex items-center gap-1 text-[11px] text-foreground/70 transition-colors hover:text-primary"
							>
								{program.title}
								<IconArrowUpRight
									className="size-3 transition-transform group-hover/program:translate-x-0.5 group-hover/program:-translate-y-0.5"
									stroke={1.75}
									aria-hidden="true"
								/>
							</Link>
						))
					) : (
						<span className="text-[11px] text-foreground/70">
							Every program
						</span>
					)}
				</div>
			</CardFooter>
		</Card>
	);
}
