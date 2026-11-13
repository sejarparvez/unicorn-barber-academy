import {
	IconArrowRight,
	IconCalendarEvent,
	IconClock,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { formatBatchDate } from '@/components/pages/enroll/types';
import { SectionHeading } from '@/components/pages/home/section-heading';
import type { ProgramBatch } from '@/components/pages/programs/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProgramBatches({
	programTitle,
	batches,
}: {
	programTitle: string;
	batches: ProgramBatch[];
}) {
	return (
		<section
			aria-labelledby="program-batches-heading"
			className="relative overflow-hidden border-y border-border/60 bg-muted/30 px-4 py-24 sm:px-6 lg:px-10"
		>
			<div className="relative mx-auto max-w-7xl">
				<SectionHeading
					id="program-batches-heading"
					eyebrow="Batches"
					title={
						<>
							Pick the <span className="text-primary">cohort</span> that fits.
						</>
					}
					description={`Morning and evening cohorts run for ${programTitle}. Seats are limited, so apply early.`}
				/>

				{batches.length === 0 ? (
					<div className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
						<p className="font-medium text-foreground text-sm">
							No batches are open right now.
						</p>
						<p className="mt-1 text-muted-foreground text-sm">
							Talk to admissions and we&apos;ll let you know when the next
							cohort opens.
						</p>
						<Button
							nativeButton={false}
							variant="outline"
							className="mt-5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
							render={<Link to="/contact" />}
						>
							Contact admissions
						</Button>
					</div>
				) : (
					<ul className="mt-10 grid gap-5 md:grid-cols-2">
						{batches.map((batch) => (
							<BatchCard key={batch.id} batch={batch} />
						))}
					</ul>
				)}
			</div>
		</section>
	);
}

function BatchCard({ batch }: { batch: ProgramBatch }) {
	const seatsLabel =
		batch.seatsRemaining === 1
			? '1 seat left'
			: `${batch.seatsRemaining} seats left`;

	return (
		<li>
			<Card className="h-full border border-border transition-colors hover:border-primary/35">
				<CardContent className="flex h-full flex-col gap-5">
					<div className="flex items-start justify-between gap-4">
						<div className="flex flex-col gap-1.5">
							<Badge
								variant="outline"
								className="w-fit border-primary/30 text-[9px] text-primary uppercase tracking-[0.16em]"
							>
								{batch.name}
							</Badge>
							<h3 className="font-semibold text-lg text-foreground tracking-tight">
								{batch.name} batch
							</h3>
						</div>
						{batch.isFull ? (
							<Badge
								variant="outline"
								className="border-destructive/30 text-destructive"
							>
								Full
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="border-primary/30 text-primary"
							>
								{seatsLabel}
							</Badge>
						)}
					</div>

					<dl className="flex flex-col gap-2.5 text-sm">
						<div className="flex items-center gap-3">
							<IconCalendarEvent
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dt className="sr-only">Dates</dt>
							<dd className="text-muted-foreground">
								Starts {formatBatchDate(batch.startDate)}
								{batch.endDate
									? ` · ends ${formatBatchDate(batch.endDate)}`
									: ''}
							</dd>
						</div>
						<div className="flex items-center gap-3">
							<IconClock
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dt className="sr-only">Schedule</dt>
							<dd className="text-muted-foreground">{batch.schedule}</dd>
						</div>
						<div className="flex items-center gap-3">
							<IconUsers
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dt className="sr-only">Capacity</dt>
							<dd className="text-muted-foreground">
								{batch.seatsTaken} of {batch.capacity} seats taken
							</dd>
						</div>
					</dl>

					<div className="mt-auto pt-1">
						{batch.isFull ? (
							<Button variant="outline" className="w-full" disabled>
								Batch full
							</Button>
						) : (
							<Button
								nativeButton={false}
								className="glow-gold h-10 w-full gap-2 font-semibold text-[12px] tracking-[0.16em]"
								render={<Link to="/enroll" search={{ batch: batch.id }} />}
							>
								APPLY FOR THIS BATCH
								<IconArrowRight className="size-4" stroke={1.75} />
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</li>
	);
}
