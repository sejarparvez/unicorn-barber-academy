import {
	IconArrowLeft,
	IconCalendarEvent,
	IconCash,
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
import {
	formatPaymentDate,
	PAYMENT_METHOD_LABELS,
} from '@/components/pages/payments/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTaka } from '@/lib/utils';
import {
	type AdminApplication,
	setEnrollmentStatus,
} from '@/server/admin/enrollments';
import type { EnrollmentPayments } from '@/server/admin/payments';
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

function PaymentsSection({
	application,
	payments,
}: {
	application: AdminApplication;
	payments: EnrollmentPayments | null;
}) {
	const canRecord =
		application.status === 'active' || application.status === 'completed';

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
				<CardTitle className="text-base">Payments</CardTitle>
				{canRecord ? (
					<Button
						size="sm"
						render={
							<Link
								to="/dashboard/payments/new"
								search={{ enrollmentId: application.id }}
							/>
						}
					>
						<IconCash stroke={1.75} />
						Record payment
					</Button>
				) : (
					<span className="text-muted-foreground text-xs">
						Approve the application to record payments.
					</span>
				)}
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<dl className="grid grid-cols-3 gap-3 text-sm">
					<div className="flex flex-col gap-0.5">
						<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							Total
						</dt>
						<dd className="tabular-nums">
							{formatTaka(payments?.totalDue ?? 0)}
						</dd>
					</div>
					<div className="flex flex-col gap-0.5">
						<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							Paid
						</dt>
						<dd className="tabular-nums">
							{formatTaka(payments?.totalPaid ?? 0)}
						</dd>
					</div>
					<div className="flex flex-col gap-0.5">
						<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							Balance
						</dt>
						<dd className="tabular-nums">
							{formatTaka(payments?.balance ?? 0)}
						</dd>
					</div>
				</dl>

				{payments && payments.payments.length > 0 ? (
					<div className="overflow-x-auto rounded-lg border border-border/60">
						<table className="w-full min-w-[560px] text-left text-sm">
							<thead className="border-border/60 border-b bg-muted/40 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
								<tr>
									<th className="px-3 py-2">Date</th>
									<th className="px-3 py-2">Method</th>
									<th className="px-3 py-2">Reference</th>
									<th className="px-3 py-2">Recorded by</th>
									<th className="px-3 py-2 text-right">Amount</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/60">
								{payments.payments.map((payment) => (
									<tr key={payment.id}>
										<td className="px-3 py-2.5 text-muted-foreground text-xs">
											{formatPaymentDate(payment.paidAt)}
										</td>
										<td className="px-3 py-2.5 text-muted-foreground text-xs">
											{PAYMENT_METHOD_LABELS[payment.method]}
										</td>
										<td className="px-3 py-2.5 text-muted-foreground text-xs">
											{payment.reference ?? '—'}
										</td>
										<td className="px-3 py-2.5 text-muted-foreground text-xs">
											{payment.recordedByName ?? '—'}
										</td>
										<td className="px-3 py-2.5 text-right font-medium tabular-nums">
											{formatTaka(payment.amount)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-muted-foreground text-sm">
						No payments recorded yet.
					</p>
				)}
			</CardContent>
		</Card>
	);
}

export function ApplicationDetail({
	application,
	payments,
}: {
	application: AdminApplication;
	payments: EnrollmentPayments | null;
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

			<PaymentsSection application={application} payments={payments} />

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
