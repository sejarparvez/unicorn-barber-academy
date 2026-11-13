import { IconTrash } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
import {
	formatPaymentDate,
	PAYMENT_METHOD_LABELS,
} from '@/components/pages/payments/types';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatTaka } from '@/lib/utils';
import { type AdminPayment, deletePayment } from '@/server/admin/payments';

export function PaymentsTable({ payments }: { payments: AdminPayment[] }) {
	if (payments.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No payments recorded yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Record a payment once a student&apos;s admission is approved.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[900px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Date</th>
						<th className="px-4 py-3">Student</th>
						<th className="px-4 py-3">Program &amp; batch</th>
						<th className="px-4 py-3">Method</th>
						<th className="px-4 py-3">Reference</th>
						<th className="px-4 py-3 text-right">Amount</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{payments.map((payment) => (
						<PaymentRow key={payment.id} payment={payment} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function PaymentRow({ payment }: { payment: AdminPayment }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function handleDelete() {
		setIsPending(true);
		try {
			await deletePayment({ data: { id: payment.id } });
			setConfirmOpen(false);
			await router.invalidate();
			toast.success('Payment deleted.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not delete the payment.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<tr className="align-top transition-colors hover:bg-muted/30">
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{formatPaymentDate(payment.paidAt)}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{payment.studentName}
					</span>
					<span className="text-muted-foreground text-xs">
						{payment.admissionNo ?? payment.studentEmail}
					</span>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{payment.programTitle}
					</span>
					<span className="text-muted-foreground text-xs">
						{payment.batchName} batch
					</span>
				</div>
			</td>
			<td className="px-4 py-4">
				<Badge variant="outline" className="text-muted-foreground">
					{PAYMENT_METHOD_LABELS[payment.method]}
				</Badge>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{payment.reference ?? '—'}
			</td>
			<td className="px-4 py-4 text-right font-medium tabular-nums">
				{formatTaka(payment.amount)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-end">
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setConfirmOpen(true)}
							aria-label="Delete payment"
							title="Delete payment"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Delete {formatTaka(payment.amount)} payment?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This removes the payment for {payment.studentName} on{' '}
									{formatPaymentDate(payment.paidAt)}. This action cannot be
									undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isPending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(event) => {
										event.preventDefault();
										void handleDelete();
									}}
									disabled={isPending}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isPending ? 'Deleting…' : 'Delete payment'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
