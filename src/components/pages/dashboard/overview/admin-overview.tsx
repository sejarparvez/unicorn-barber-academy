import {
	IconArrowRight,
	IconCalendarEvent,
	IconCash,
	IconCertificate,
	IconClipboardList,
	IconClockExclamation,
	IconMail,
	IconRosetteDiscountCheck,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { StatCard } from '@/components/pages/dashboard/overview/stat-card';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import { formatBatchDate } from '@/components/pages/enroll/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTaka } from '@/lib/utils';
import type { AdminOverview } from '@/server/dashboard';

export function AdminOverviewView({ data }: { data: AdminOverview }) {
	const { stats, recentApplications, recentEnquiries } = data;

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<StatCard
					icon={IconClipboardList}
					label="Pending applications"
					value={String(stats.pendingApplications)}
					hint="Awaiting a decision"
				/>
				<StatCard
					icon={IconUsers}
					label="Active students"
					value={String(stats.activeStudents)}
					hint="Currently enrolled"
				/>
				<StatCard
					icon={IconMail}
					label="New enquiries"
					value={String(stats.newEnquiries)}
					hint="Unread contact messages"
				/>
				<StatCard
					icon={IconCalendarEvent}
					label="Batches running"
					value={String(stats.runningBatches)}
					hint="In progress now"
				/>
				<StatCard
					icon={IconCash}
					label="Collected"
					value={formatTaka(stats.collected)}
					hint="Total payments received"
				/>
				<StatCard
					icon={IconClockExclamation}
					label="Outstanding"
					value={formatTaka(stats.outstanding)}
					hint="Balance on active students"
				/>
				<StatCard
					icon={IconCertificate}
					label="Certificates issued"
					value={String(stats.certificatesIssued)}
					hint="All time"
				/>
				<StatCard
					icon={IconRosetteDiscountCheck}
					label="Completed programs"
					value={String(stats.completedPrograms)}
					hint="Students who finished"
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-3">
						<CardTitle className="text-base">Recent applications</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
							render={<Link to="/dashboard/applications" />}
						>
							View all
							<IconArrowRight className="size-3.5" stroke={1.75} />
						</Button>
					</CardHeader>
					<CardContent>
						{recentApplications.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								No applications yet.
							</p>
						) : (
							<ul className="divide-y divide-border/60">
								{recentApplications.map((application) => (
									<li key={application.id}>
										<Link
											to="/dashboard/applications/$enrollmentId"
											params={{ enrollmentId: application.id }}
											className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-muted/40"
										>
											<div className="flex min-w-0 flex-col gap-0.5">
												<span className="truncate font-medium text-sm">
													{application.studentName}
												</span>
												<span className="truncate text-muted-foreground text-xs">
													{application.programTitle} · {application.batchName}{' '}
													batch
												</span>
											</div>
											<div className="flex shrink-0 flex-col items-end gap-1">
												<EnrollmentStatusBadge status={application.status} />
												<span className="text-muted-foreground text-[11px]">
													{formatBatchDate(application.createdAt)}
												</span>
											</div>
										</Link>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between gap-3">
						<CardTitle className="text-base">Recent enquiries</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground"
							render={<Link to="/dashboard/enquiries" />}
						>
							Open inbox
							<IconArrowRight className="size-3.5" stroke={1.75} />
						</Button>
					</CardHeader>
					<CardContent>
						{recentEnquiries.length === 0 ? (
							<p className="py-6 text-center text-muted-foreground text-sm">
								No enquiries yet.
							</p>
						) : (
							<ul className="divide-y divide-border/60">
								{recentEnquiries.map((enquiry) => (
									<li key={enquiry.id} className="flex flex-col gap-1 py-3">
										<div className="flex items-center justify-between gap-3">
											<span className="truncate font-medium text-sm">
												{enquiry.name}
											</span>
											<span className="shrink-0 text-muted-foreground text-[11px]">
												{formatBatchDate(enquiry.createdAt)}
											</span>
										</div>
										<span className="text-muted-foreground text-xs">
											{enquiry.interestLabel}
										</span>
										<span className="line-clamp-2 text-muted-foreground text-xs">
											{enquiry.message}
										</span>
									</li>
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
