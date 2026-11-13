import {
	IconArrowRight,
	IconCalendarEvent,
	IconClock,
	IconSchool,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import { formatBatchDate } from '@/components/pages/enroll/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { MyEnrollment } from '@/server/enrollments';

export function MyProgramsList({
	enrollments,
}: {
	enrollments: MyEnrollment[];
}) {
	if (enrollments.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
				<IconSchool
					className="mx-auto size-8 text-primary/70"
					stroke={1.6}
					aria-hidden="true"
				/>
				<p className="mt-4 font-medium text-foreground">
					You haven&apos;t applied to a program yet.
				</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Browse the catalogue and apply to a batch that fits your schedule.
				</p>
				<Button
					nativeButton={false}
					className="mt-5"
					render={<Link to="/programs" />}
				>
					Browse programs
					<IconArrowRight className="size-4" stroke={1.75} />
				</Button>
			</div>
		);
	}

	return (
		<ul className="flex flex-col gap-4">
			{enrollments.map((enrollment) => (
				<li key={enrollment.id}>
					<Card className="border border-border">
						<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex flex-col gap-2">
								<div className="flex flex-wrap items-center gap-2.5">
									<h2 className="font-semibold text-base tracking-tight">
										{enrollment.programTitle}
									</h2>
									<EnrollmentStatusBadge status={enrollment.status} />
									{enrollment.admissionNo ? (
										<Badge
											variant="outline"
											className="border-primary/30 text-primary"
										>
											{enrollment.admissionNo}
										</Badge>
									) : null}
								</div>
								<dl className="flex flex-wrap gap-x-6 gap-y-1.5 text-muted-foreground text-sm">
									<div className="flex items-center gap-2">
										<IconSchool
											className="size-3.5 text-primary/80"
											stroke={1.6}
											aria-hidden="true"
										/>
										<dd>{enrollment.batchName} batch</dd>
									</div>
									<div className="flex items-center gap-2">
										<IconCalendarEvent
											className="size-3.5 text-primary/80"
											stroke={1.6}
											aria-hidden="true"
										/>
										<dd>Starts {formatBatchDate(enrollment.batchStartDate)}</dd>
									</div>
									<div className="flex items-center gap-2">
										<IconClock
											className="size-3.5 text-primary/80"
											stroke={1.6}
											aria-hidden="true"
										/>
										<dd>{enrollment.batchSchedule}</dd>
									</div>
								</dl>
							</div>

							<Button
								nativeButton={false}
								variant="outline"
								className="shrink-0"
								render={
									<Link
										to="/programs/$slug"
										params={{ slug: enrollment.programSlug }}
									/>
								}
							>
								View program
							</Button>
						</CardContent>
					</Card>
				</li>
			))}
		</ul>
	);
}
