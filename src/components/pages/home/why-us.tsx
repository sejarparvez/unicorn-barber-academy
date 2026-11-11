import {
	IconArrowRight,
	IconBriefcase,
	IconClockHour4,
	IconScissors,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from './section-heading';

const FEATURES = [
	{
		icon: IconScissors,
		title: 'Taught by working professionals',
		description:
			"Every instructor still works a chair or a station. You learn what's current, not what's textbook.",
	},
	{
		icon: IconBriefcase,
		title: 'Full kit included',
		description:
			'Clippers and shears, or a professional makeup and styling kit — yours from week one. No extra spend.',
	},
	{
		icon: IconUsers,
		title: 'Job placement support',
		description:
			'Sixty partner salons and barbershops hire straight out of our cohorts.',
	},
	{
		icon: IconClockHour4,
		title: 'Day & evening cohorts',
		description:
			'Train around a job or family. Same curriculum, same instructors, your schedule.',
	},
];

const INSTRUCTORS_LINK = { label: 'Meet the instructors', to: '/instructors' };

export default function WhyUnicorn() {
	return (
		<section
			aria-labelledby="why-heading"
			className="section-light bg-background px-4 py-24 lg:px-10"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="why-heading"
						eyebrow="Why Unicorn"
						title={
							<>
								Built for the chair,{' '}
								<span className="text-primary">not the classroom</span>.
							</>
						}
						description="A working academy, not a lecture hall. Everything here is designed to get you comfortable behind the chair — and hired."
					/>

					<Link
						to={INSTRUCTORS_LINK.to}
						className="group inline-flex shrink-0 items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
					>
						{INSTRUCTORS_LINK.label}
						<IconArrowRight
							className="size-3.5 transition-transform group-hover:translate-x-0.5"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature, index) => (
						<div
							key={feature.title}
							className="group relative h-full bg-card p-7 transition-colors hover:bg-primary/5"
						>
							<div className="flex items-start justify-between gap-4">
								<span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
									<feature.icon
										className="size-5"
										stroke={1.5}
										aria-hidden="true"
									/>
								</span>
								<span className="font-mono text-[11px] text-muted-foreground/50 tracking-[0.2em]">
									{String(index + 1).padStart(2, '0')}
								</span>
							</div>

							<h3 className="mt-5 font-semibold text-base text-foreground">
								{feature.title}
							</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
