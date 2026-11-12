import {
	IconArrowUpRight,
	IconBrush,
	IconCertificate,
	IconRazor,
	IconScissors,
} from '@tabler/icons-react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const CHAPTERS = [
	{
		number: '01',
		icon: IconScissors,
		title: 'The first chair',
		description:
			'A single working station in Banasree, and a handful of students who learned by watching first, then doing.',
	},
	{
		number: '02',
		icon: IconRazor,
		title: 'The first cohort',
		description:
			'Word spread. We formalised the curriculum around the chair — foundations, fades, beard work and finishing.',
	},
	{
		number: '03',
		icon: IconBrush,
		title: 'The full academy',
		description:
			'Styling, colour and bridal makeup joined the barbering programs. Kits, cohorts and placement support followed.',
	},
	{
		number: '04',
		icon: IconCertificate,
		title: 'The next chapter',
		description:
			'A growing network of hiring partners, and one promise unchanged: you leave ready for the shop floor.',
	},
];

const STATS = [
	{ value: '6', label: 'Career programs' },
	{ value: '60+', label: 'Hiring partners' },
	{ value: '2', label: 'Cohort times' },
	{ value: '100%', label: 'Hands-on' },
];

export default function Timeline() {
	return (
		<section
			aria-labelledby="timeline-heading"
			className="section-light relative overflow-hidden border-b border-border bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-40 [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_75%)]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<SectionHeading
					id="timeline-heading"
					align="center"
					eyebrow="The journey"
					title={
						<>
							From one chair to a{' '}
							<span className="text-primary">full academy</span>.
						</>
					}
					description="No investors, no franchise playbook. Just a working floor that kept getting busier."
				/>

				<div className="relative mt-16">
					{/* Horizontal spine — desktop only */}
					<div
						aria-hidden="true"
						className="absolute top-5 right-0 left-0 hidden h-px bg-linear-to-r from-transparent via-border to-transparent lg:block"
					/>
					{/* Vertical spine — mobile only */}
					<div
						aria-hidden="true"
						className="absolute top-5 bottom-0 left-5 w-px bg-border lg:hidden"
					/>

					<ol className="relative grid gap-6 lg:grid-cols-4 lg:gap-5">
						{CHAPTERS.map((chapter) => (
							<li key={chapter.number} className="relative flex flex-col">
								<div className="flex items-center gap-4 lg:flex-col lg:items-start">
									<span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background font-semibold text-[11px] text-primary tabular-nums shadow-xs">
										{chapter.number}
									</span>
									<span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-[0.24em] lg:mt-4">
										Chapter
									</span>
								</div>

								<Card className="mt-5 flex-1 gap-0 border border-border py-0 transition-colors hover:border-primary/35 hover:bg-primary/[0.03]">
									<CardHeader className="pt-6">
										<span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
											<chapter.icon
												className="size-5"
												stroke={1.5}
												aria-hidden="true"
											/>
										</span>
										<h3 className="mt-4 font-semibold text-base text-foreground tracking-tight">
											{chapter.title}
										</h3>
									</CardHeader>
									<CardContent className="pt-4 pb-6">
										<p className="text-muted-foreground text-sm leading-relaxed">
											{chapter.description}
										</p>
									</CardContent>
								</Card>
							</li>
						))}
					</ol>
				</div>

				{/* ── At a glance ── */}
				<div className="mt-16 overflow-hidden rounded-2xl border border-border bg-card">
					<dl className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
						{STATS.map((stat) => (
							<div
								key={stat.label}
								className="flex flex-col items-center gap-1 px-4 py-7 text-center"
							>
								<dt className="order-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
									{stat.label}
								</dt>
								<dd className="order-1 font-bold text-3xl text-primary tracking-tight sm:text-4xl">
									{stat.value}
								</dd>
							</div>
						))}
					</dl>
				</div>

				<p className="mt-6 flex items-center justify-center gap-1.5 text-center font-medium text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
					<span className="text-primary">
						<IconArrowUpRight className="size-3.5" stroke={1.75} />
					</span>
					Same promise since the first chair
				</p>
			</div>
		</section>
	);
}
