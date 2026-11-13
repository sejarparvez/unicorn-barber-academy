import {
	IconArrowRight,
	IconCalendarEvent,
	IconClock,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { formatBatchDate } from '@/components/pages/enroll/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { EnrollmentOption } from '@/server/batches';

export function BatchPicker({ options }: { options: EnrollmentOption[] }) {
	if (options.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
				<p className="font-medium text-foreground">No batches are open yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Check back soon, or talk to admissions about the next cohort.
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
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{options.map((option) => (
				<div key={option.programSlug} className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-4">
						<h2 className="font-semibold text-lg tracking-tight">
							{option.programTitle}
						</h2>
						<Link
							to="/programs/$slug"
							params={{ slug: option.programSlug }}
							className="text-primary text-sm hover:underline"
						>
							View program
						</Link>
					</div>

					<ul className="grid gap-4 sm:grid-cols-2">
						{option.batches.map((batch) => (
							<li key={batch.id}>
								<Card className="h-full border border-border transition-colors hover:border-primary/35">
									<CardContent className="flex h-full flex-col gap-4">
										<div className="flex items-start justify-between gap-3">
											<Badge
												variant="outline"
												className="w-fit border-primary/30 text-[9px] text-primary uppercase tracking-[0.16em]"
											>
												{batch.name}
											</Badge>
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
													{batch.seatsRemaining} seats left
												</Badge>
											)}
										</div>

										<dl className="flex flex-col gap-2 text-sm">
											<div className="flex items-center gap-2.5">
												<IconCalendarEvent
													className="size-4 shrink-0 text-primary/80"
													stroke={1.6}
													aria-hidden="true"
												/>
												<dd className="text-muted-foreground">
													Starts {formatBatchDate(batch.startDate)}
												</dd>
											</div>
											<div className="flex items-center gap-2.5">
												<IconClock
													className="size-4 shrink-0 text-primary/80"
													stroke={1.6}
													aria-hidden="true"
												/>
												<dd className="text-muted-foreground">
													{batch.schedule}
												</dd>
											</div>
										</dl>

										<div className="mt-auto">
											{batch.isFull ? (
												<Button variant="outline" className="w-full" disabled>
													Batch full
												</Button>
											) : (
												<Button
													nativeButton={false}
													className="h-10 w-full gap-2 font-semibold text-[12px] tracking-[0.14em]"
													render={
														<Link to="/enroll" search={{ batch: batch.id }} />
													}
												>
													APPLY
													<IconArrowRight className="size-4" stroke={1.75} />
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
}
