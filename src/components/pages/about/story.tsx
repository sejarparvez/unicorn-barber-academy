import {
	IconArrowRight,
	IconCheck,
	IconQuote,
	IconScissors,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const STANDARDS = [
	'Every student cuts on day one — no months of observation.',
	'Instructors work in the industry, not just in a classroom.',
	'Kits are included, so no one is held back by hidden costs.',
	'Cohorts stay small enough to correct your hands, not just your attendance.',
	'Placement support continues until you are behind a chair.',
];

const PROGRAMS_LINK: { label: string; to: string } = {
	label: 'See what we teach',
	to: '/programs',
};

export default function Story() {
	return (
		<section
			aria-labelledby="story-heading"
			className="section-light relative overflow-hidden border-b border-border bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute top-0 right-0 size-112 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="grid gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
					{/* ── Narrative ── */}
					<div>
						<SectionHeading
							id="story-heading"
							eyebrow="How we started"
							title={
								<>
									Built in a barbershop,{' '}
									<span className="text-primary">not a boardroom</span>.
								</>
							}
							description="The academy began with a simple frustration: too many students leave training with a certificate and no chair time."
						/>

						<div className="mt-8 space-y-5 text-pretty text-secondary-foreground/80 leading-relaxed">
							<p className="text-lg text-foreground/85 leading-relaxed">
								We opened our doors in Banasree with one belief — barbering is a
								hand skill, and hand skills are learned at the chair.
							</p>
							<p>
								So we built the academy around a working floor. Students do not
								sit in rows; they stand beside instructors, watch a cut happen,
								then do it themselves. The clippers are real, the mannequins are
								real, and the first live client is a milestone, not a rumour.
							</p>
							<p>
								We kept the class sizes small, the kits complete, and the
								instructors working. If a technique changes on the shop floor,
								it changes in the curriculum that same week. That is the whole
								idea: what you learn on Monday still works on Saturday.
							</p>
							<p>
								Today we train barbers, stylists and makeup artists across six
								career programs — with day and evening cohorts, and a placement
								team that knows the salons doing the hiring.
							</p>
						</div>

						<Link
							to={PROGRAMS_LINK.to}
							className="group mt-8 inline-flex items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em] transition-colors hover:text-primary/80"
						>
							{PROGRAMS_LINK.label}
							<IconArrowRight
								className="size-3.5 transition-transform group-hover:translate-x-0.5"
								stroke={1.75}
							/>
						</Link>
					</div>

					{/* ── Standards card ── */}
					<div className="relative lg:pt-4">
						<div
							aria-hidden="true"
							className="absolute -inset-3 rounded-[1.75rem] border border-primary/20 sm:-inset-4"
						/>
						<Card className="relative gap-0 overflow-hidden border border-border bg-card py-0 shadow-sm">
							<span
								aria-hidden="true"
								className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent"
							/>

							<CardHeader className="pt-7">
								<div className="flex items-start justify-between gap-4">
									<div>
										<Badge
											variant="outline"
											className="border-primary/30 text-[9px] text-primary tracking-[0.18em]"
										>
											THE UNICORN STANDARD
										</Badge>
										<h3 className="mt-4 text-balance font-semibold text-xl tracking-tight">
											No shortcuts. No filler modules.
										</h3>
									</div>
									<span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/5 text-primary">
										<IconScissors
											className="size-5"
											stroke={1.5}
											aria-hidden="true"
										/>
									</span>
								</div>
							</CardHeader>

							<CardContent className="pt-6 pb-7">
								<ul className="space-y-3.5">
									{STANDARDS.map((standard) => (
										<li
											key={standard}
											className="flex items-start gap-3 text-secondary-foreground/85 text-sm leading-relaxed"
										>
											<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
												<IconCheck className="size-3" stroke={2.25} />
											</span>
											{standard}
										</li>
									))}
								</ul>

								<Separator className="my-6" />

								<p className="text-muted-foreground text-xs leading-relaxed">
									Every promise here is written into how a cohort runs — not
									just a line on a brochure.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* ── Founder quote ── */}
				<figure className="relative mt-16 overflow-hidden rounded-2xl border border-primary/20 bg-card px-6 py-8 sm:px-10 sm:py-10 lg:mt-20">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -top-10 -right-6 text-primary/5"
					>
						<IconQuote className="size-48" stroke={1} />
					</div>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-transparent via-primary to-transparent"
					/>

					<blockquote className="relative max-w-4xl text-balance font-medium text-foreground text-xl leading-snug tracking-tight sm:text-2xl">
						&ldquo;We do not measure a cohort by how many students finish. We
						measure it by how many are still behind a chair a year later.&rdquo;
					</blockquote>

					<figcaption className="relative mt-6 flex items-center gap-3">
						<span aria-hidden="true" className="h-px w-8 bg-primary/70" />
						<span className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							Founder &amp; Lead Instructor
						</span>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
