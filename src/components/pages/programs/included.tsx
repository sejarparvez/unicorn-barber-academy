import {
	IconArrowRight,
	IconBriefcase,
	IconCertificate,
	IconScissors,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from '@/components/pages/home/section-heading';

const CONTACT_LINK = { label: 'Talk to admissions', to: '/contact' };

const PROGRAM_INCLUDES = [
	{
		icon: IconScissors,
		title: 'A full professional kit',
		description:
			'Clippers and shears, or the styling and makeup kit for your track — yours from week one. No extra spend.',
	},
	{
		icon: IconCertificate,
		title: 'NTVQF certification',
		description:
			'Assessed throughout the course and certified under the National Technical and Vocational Qualification Framework.',
	},
	{
		icon: IconUsers,
		title: 'Small cohorts',
		description:
			'Capped class sizes mean your instructor sees your hands, corrects your grip and catches habits early.',
	},
	{
		icon: IconBriefcase,
		title: 'Placement support',
		description:
			'Portfolio reviews, interview prep and introductions to the 60+ salons and barbershops that hire from us.',
	},
];

export default function ProgramsIncluded() {
	return (
		<section
			aria-labelledby="programs-included-heading"
			className="relative overflow-hidden bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 left-1/2 size-[30rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[130px]"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-30 [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<SectionHeading
					id="programs-included-heading"
					align="center"
					eyebrow="Included in every program"
					title={
						<>
							One standard, whichever{' '}
							<span className="text-primary">craft</span> you choose.
						</>
					}
					description="The track changes. The kit, the class size and the promise that you leave ready for the floor do not."
				/>

				<div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
					{PROGRAM_INCLUDES.map((item, index) => (
						<div
							key={item.title}
							className="group relative h-full bg-card p-7 transition-colors hover:bg-primary/5"
						>
							<div className="flex items-start justify-between gap-4">
								<span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
									<item.icon
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
								{item.title}
							</h3>
							<p className="mt-2 text-muted-foreground text-sm leading-relaxed">
								{item.description}
							</p>
						</div>
					))}
				</div>

				<div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-border/70 bg-card/40 px-5 py-4 sm:flex-row">
					<p className="text-center text-muted-foreground text-sm sm:text-left">
						Not sure which track fits? Tell us what you want to do behind the
						chair and we will point you to the right one.
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
