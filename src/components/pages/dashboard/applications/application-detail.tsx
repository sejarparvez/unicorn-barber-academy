import {
	IconArrowLeft,
	IconCalendarEvent,
	IconClock,
	IconCurrencyTaka,
	IconUsers,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { differenceInYears, parseISO } from 'date-fns';
import { useState } from 'react';
import { toast } from 'sonner';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:gap-4">
			<dt className="w-full shrink-0 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.12em] sm:w-52 sm:pt-0.5">
				{label}
			</dt>
			<dd className="text-foreground text-sm">
				{value || <span className="text-muted-foreground/60">—</span>}
			</dd>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<dl className="divide-y divide-border/60">{children}</dl>
			</CardContent>
		</Card>
	);
}

export function ApplicationDetail({
	application,
}: {
	application: AdminApplication;
}) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const actions = actionsFor(application.status);

	const age = differenceInYears(new Date(), parseISO(application.dateOfBirth));

	async function changeStatus(status: EnrollmentStatus, label: string) {
		setIsPending(true);
		try {
			await setEnrollmentStatus({ data: { id: application.id, status } });
			await router.invalidate();
			toast.success(`Application ${label.toLowerCase()}.`);
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
		<div className="flex flex-col gap-6">
			<div>
				<Button
					variant="ghost"
					size="sm"
					className="-ml-2 text-muted-foreground"
					render={<Link to="/dashboard/applications" />}
				>
					<IconArrowLeft stroke={1.75} />
					All applications
				</Button>
			</div>

			<Card className="border border-primary/25 bg-primary/[0.04]">
				<CardContent className="flex flex-col gap-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="flex flex-col gap-1.5">
							<div className="flex flex-wrap items-center gap-2.5">
								<h1 className="font-semibold text-2xl tracking-tight">
									{application.fullName}
								</h1>
								<EnrollmentStatusBadge status={application.status} />
							</div>
							<p className="text-muted-foreground text-sm">
								{application.programTitle} · {application.batchName} batch
							</p>
							<p className="text-muted-foreground text-xs">
								Applied {formatDate(application.createdAt)}
								{application.decidedAt
									? ` · decided ${formatDate(application.decidedAt)}`
									: ''}
							</p>
						</div>

						{application.admissionNo ? (
							<div className="flex flex-col items-start gap-1 sm:items-end">
								<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
									Admission no.
								</span>
								<Badge
									variant="outline"
									className="border-primary/30 text-primary"
								>
									{application.admissionNo}
								</Badge>
								{application.admittedAt ? (
									<span className="text-muted-foreground text-xs">
										Admitted {formatDate(application.admittedAt)}
									</span>
								) : null}
							</div>
						) : null}
					</div>

					<dl className="flex flex-wrap gap-x-8 gap-y-2.5 text-sm">
						<div className="flex items-center gap-2.5">
							<IconCalendarEvent
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dd className="text-muted-foreground">
								Starts {formatDate(application.batchStartDate)}
							</dd>
						</div>
						<div className="flex items-center gap-2.5">
							<IconClock
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dd className="text-muted-foreground">
								{application.batchSchedule}
							</dd>
						</div>
						<div className="flex items-center gap-2.5">
							<IconUsers
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dd className="text-muted-foreground">
								{application.studentEmail}
							</dd>
						</div>
						<div className="flex items-center gap-2.5">
							<IconCurrencyTaka
								className="size-4 shrink-0 text-primary/80"
								stroke={1.6}
								aria-hidden="true"
							/>
							<dd className="text-muted-foreground">{application.phone}</dd>
						</div>
					</dl>

					<div className="flex flex-wrap gap-2">
						{actions.length === 0 ? (
							<span className="text-muted-foreground text-sm">
								No further actions for this status.
							</span>
						) : (
							actions.map((action) => (
								<Button
									key={action.status}
									variant={action.primary ? 'default' : 'outline'}
									disabled={isPending}
									onClick={() => void changeStatus(action.status, action.label)}
								>
									{action.label}
								</Button>
							))
						)}
					</div>
				</CardContent>
			</Card>

			<Section title="1. Student information">
				<DataRow label="Full name" value={application.fullName} />
				<DataRow label="Father's name" value={application.fatherName} />
				<DataRow label="Mother's name" value={application.motherName} />
				<DataRow
					label="Date of birth"
					value={`${formatDate(application.dateOfBirth)} (age ${age})`}
				/>
				<DataRow label="Nationality" value={application.nationality} />
				<DataRow label="Gender" value={application.gender} />
				<DataRow
					label="NID / birth certificate no."
					value={application.nidNumber}
				/>
			</Section>

			<Section title="2. Contact information">
				<DataRow label="Mobile number" value={application.phone} />
				<DataRow label="WhatsApp / email" value={application.whatsapp} />
				<DataRow label="Present address" value={application.presentAddress} />
				<DataRow
					label="Permanent address"
					value={application.permanentAddress}
				/>
			</Section>

			<Section title="3. Emergency contact">
				<DataRow label="Name" value={application.emergencyName} />
				<DataRow label="Relation" value={application.emergencyRelation} />
				<DataRow label="Mobile" value={application.emergencyMobile} />
				<DataRow label="Address" value={application.emergencyAddress} />
			</Section>

			<Section title="4. Education & previous experience">
				<DataRow label="Education" value={application.education} />
				<DataRow
					label="Barbering experience"
					value={
						application.hasBarberingExperience
							? application.barberingExperienceDuration
							: 'None'
					}
				/>
				<DataRow
					label="Previous training"
					value={
						application.hasPreviousTraining
							? application.previousTrainingInstitution
							: 'No'
					}
				/>
				<DataRow label="Goal" value={application.goal} />
			</Section>
		</div>
	);
}
