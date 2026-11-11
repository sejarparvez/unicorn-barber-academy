import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from './section-heading';

const STATS = [
	{
		value: '60+',
		label: 'Hiring partners',
		description: 'Salons and barbershops that recruit from our cohorts.',
	},
	{
		value: '6',
		label: 'Career programs',
		description: 'Barbering, styling, colour and editorial makeup.',
	},
	{
		value: '100%',
		label: 'Hands-on training',
		description: 'Real tools, mannequins and live client work.',
	},
	{
		value: '2',
		label: 'Cohort times',
		description: 'Day and evening schedules, same curriculum.',
	},
];

export default function Stats() {
	return (
		<section
			aria-labelledby="stats-heading"
			className="section-light relative overflow-hidden border-border border-t bg-background px-4 py-20 sm:px-6 lg:px-10 lg:py-24"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-40 [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<SectionHeading
					id="stats-heading"
					align="center"
					eyebrow="The academy in numbers"
					title={
						<>
							Built to get you <span className="text-primary">hired</span>.
						</>
					}
					description="Four numbers that describe how training at Unicorn actually works."
				/>

				<div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
					{STATS.map((stat) => (
						<Card
							key={stat.label}
							className="text-center transition-colors hover:ring-primary/30"
						>
							<CardContent className="flex flex-col items-center gap-2 py-3">
								<p className="font-bold text-4xl text-primary tracking-tight sm:text-5xl">
									{stat.value}
								</p>
								<p className="font-semibold text-[11px] text-foreground uppercase tracking-[0.18em]">
									{stat.label}
								</p>
								<p className="mt-1 max-w-[16rem] text-muted-foreground text-xs leading-relaxed">
									{stat.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
