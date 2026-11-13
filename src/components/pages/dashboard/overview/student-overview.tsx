import {
	IconArrowRight,
	IconCertificate,
	IconClipboardList,
	IconClockExclamation,
	IconSchool,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { StatCard } from '@/components/pages/dashboard/overview/stat-card';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTaka } from '@/lib/utils';
import type { StudentOverview } from '@/server/dashboard';

export function StudentOverviewView({ data }: { data: StudentOverview }) {
	const { stats, recentPrograms } = data;

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={IconSchool}
					label="Active programs"
					value={String(stats.activePrograms)}
					hint="Currently studying"
				/>
				<StatCard
					icon={IconClipboardList}
					label="Pending applications"
					value={String(stats.pendingApplications)}
					hint="Awaiting a decision"
				/>
				<StatCard
					icon={IconClockExclamation}
					label="Balance due"
					value={formatTaka(stats.balance)}
					hint={stats.balance > 0 ? 'Across active programs' : 'All settled'}
				/>
				<StatCard
					icon={IconCertificate}
					label="Certificates"
					value={String(stats.certificates)}
					hint="Earned so far"
				/>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between gap-3">
					<CardTitle className="text-base">Your programs</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground"
						render={<Link to="/dashboard/my-programs" />}
					>
						View all
						<IconArrowRight className="size-3.5" stroke={1.75} />
					</Button>
				</CardHeader>
				<CardContent>
					{recentPrograms.length === 0 ? (
						<div className="flex flex-col items-center gap-3 py-8 text-center">
							<IconSchool
								className="size-8 text-primary/70"
								stroke={1.6}
								aria-hidden="true"
							/>
							<p className="font-medium text-sm">
								You haven&apos;t applied to a program yet.
							</p>
							<p className="max-w-sm text-muted-foreground text-sm">
								Browse the catalogue and apply to a batch that fits your
								schedule.
							</p>
							<Button className="mt-1" render={<Link to="/programs" />}>
								Browse programs
								<IconArrowRight className="size-4" stroke={1.75} />
							</Button>
						</div>
					) : (
						<ul className="divide-y divide-border/60">
							{recentPrograms.map((program) => (
								<li key={program.id}>
									<Link
										to="/programs/$slug"
										params={{ slug: program.programSlug }}
										className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/40"
									>
										<div className="flex min-w-0 flex-col gap-0.5">
											<span className="truncate font-medium text-sm">
												{program.programTitle}
											</span>
											<span className="truncate text-muted-foreground text-xs">
												{program.batchName} batch
											</span>
										</div>
										<EnrollmentStatusBadge status={program.status} />
									</Link>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
