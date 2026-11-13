import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	type AdminApplication,
	setEnrollmentStatus,
} from '@/server/admin/enrollments';
import { actionsFor } from './actions';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function ApplicationsTable({
	applications,
}: {
	applications: AdminApplication[];
}) {
	if (applications.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No applications yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Applications submitted from the public site show up here.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[900px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Applicant</th>
						<th className="px-4 py-3">Program &amp; batch</th>
						<th className="px-4 py-3">Applied</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{applications.map((application) => (
						<ApplicationRow key={application.id} application={application} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function ApplicationRow({ application }: { application: AdminApplication }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const actions = actionsFor(application.status);

	async function changeStatus(status: EnrollmentStatus, label: string) {
		setIsPending(true);
		try {
			await setEnrollmentStatus({ data: { id: application.id, status } });
			await router.invalidate();
			toast.success(`${application.fullName}: ${label.toLowerCase()}.`);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not update the application.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<tr className="align-top transition-colors hover:bg-muted/30">
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{application.fullName}
					</span>
					<span className="text-muted-foreground text-xs">
						{application.studentEmail}
					</span>
					<span className="text-muted-foreground text-xs">
						{application.phone}
					</span>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{application.programTitle}
					</span>
					<span className="text-muted-foreground text-xs">
						{application.batchName} · {application.batchSchedule}
					</span>
					<span className="text-muted-foreground text-xs">
						Starts {formatDate(application.batchStartDate)}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{formatDate(application.createdAt)}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col items-start gap-1.5">
					<EnrollmentStatusBadge status={application.status} />
					{application.admissionNo ? (
						<Badge variant="outline" className="border-primary/30 text-primary">
							{application.admissionNo}
						</Badge>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap items-center justify-end gap-1.5">
					<Button
						variant="outline"
						size="sm"
						render={
							<Link
								to="/dashboard/applications/$enrollmentId"
								params={{ enrollmentId: application.id }}
							/>
						}
					>
						View form
					</Button>
					{actions.map((action) => (
						<Button
							key={action.status}
							variant={action.primary ? 'default' : 'outline'}
							size="sm"
							disabled={isPending}
							onClick={() => void changeStatus(action.status, action.label)}
						>
							{action.label}
						</Button>
					))}
				</div>
			</td>
		</tr>
	);
}
