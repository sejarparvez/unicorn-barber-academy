import { IconReceipt, IconSchool } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { EnrollmentStatusBadge } from '@/components/pages/enroll/status-badge';
import {
	formatPaymentDate,
	PAYMENT_METHOD_LABELS,
} from '@/components/pages/payments/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatTaka } from '@/lib/utils';
import type { MyPayments } from '@/server/payments';

export function MyPaymentsList({ data }: { data: MyPayments }) {
	if (data.enrollments.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
				<IconReceipt
					className="mx-auto size-8 text-primary/70"
					stroke={1.6}
					aria-hidden="true"
				/>
				<p className="mt-4 font-medium text-foreground">No payments yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Once your admission is approved and a payment is recorded, it will
					show up here.
				</p>
				<Button
					className="mt-5"
					variant="outline"
					render={<Link to="/programs" />}
				>
					<IconSchool stroke={1.75} />
					Browse programs
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="grid gap-4 sm:grid-cols-3">
				<SummaryStat label="Total payable" value={data.totalDue} />
				<SummaryStat label="Paid" value={data.totalPaid} />
				<SummaryStat label="Balance" value={data.balance} highlight />
			</div>

			<div className="flex flex-col gap-4">
				{data.enrollments.map((enrollment) => (
					<Card key={enrollment.id}>
						<CardContent className="flex flex-col gap-5">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="flex flex-col gap-1.5">
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
									<p className="text-muted-foreground text-sm">
										{enrollment.batchName} batch
									</p>
								</div>

								{enrollment.isPaidOff ? (
									<Badge
										variant="outline"
										className="border-primary/30 text-primary"
									>
										Paid in full
									</Badge>
								) : (
									<span className="font-semibold text-foreground text-sm tabular-nums">
										{formatTaka(enrollment.balance)} due
									</span>
								)}
							</div>

							<dl className="grid grid-cols-3 gap-3 border-border/60 border-t pt-4 text-sm">
								<div className="flex flex-col gap-0.5">
									<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
										Total
									</dt>
									<dd className="tabular-nums">
										{formatTaka(enrollment.totalDue)}
									</dd>
								</div>
								<div className="flex flex-col gap-0.5">
									<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
										Paid
									</dt>
									<dd className="tabular-nums">
										{formatTaka(enrollment.totalPaid)}
									</dd>
								</div>
								<div className="flex flex-col gap-0.5">
									<dt className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
										Balance
									</dt>
									<dd className="tabular-nums">
										{formatTaka(enrollment.balance)}
									</dd>
								</div>
							</dl>

							{enrollment.payments.length === 0 ? (
								<p className="text-muted-foreground text-sm">
									No payments recorded yet.
								</p>
							) : (
								<div className="overflow-x-auto rounded-lg border border-border/60">
									<table className="w-full min-w-[480px] text-left text-sm">
										<thead className="border-border/60 border-b bg-muted/40 font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
											<tr>
												<th className="px-3 py-2">Date</th>
												<th className="px-3 py-2">Method</th>
												<th className="px-3 py-2">Reference</th>
												<th className="px-3 py-2 text-right">Amount</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border/60">
											{enrollment.payments.map((payment) => (
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
													<td className="px-3 py-2.5 text-right font-medium tabular-nums">
														{formatTaka(payment.amount)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}

function SummaryStat({
	label,
	value,
	highlight,
}: {
	label: string;
	value: number;
	highlight?: boolean;
}) {
	return (
		<Card
			className={highlight ? 'border border-primary/25 bg-primary/[0.04]' : ''}
		>
			<CardContent className="flex flex-col gap-0.5">
				<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					{label}
				</span>
				<span className="font-semibold text-xl tabular-nums tracking-tight">
					{formatTaka(value)}
				</span>
			</CardContent>
		</Card>
	);
}
