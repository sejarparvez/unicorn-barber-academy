import {
	IconEye,
	IconEyeOff,
	IconPencil,
	IconTrash,
} from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { toast } from 'sonner';
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
import {
	type AdminBatchSummary,
	deleteBatch,
	setBatchHidden,
} from '@/server/admin/batches';

const STATUS_LABELS: Record<AdminBatchSummary['status'], string> = {
	upcoming: 'Upcoming',
	running: 'Running',
	completed: 'Completed',
	cancelled: 'Cancelled',
};

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function BatchesTable({ batches }: { batches: AdminBatchSummary[] }) {
	if (batches.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No batches yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Create a morning or evening cohort for a program.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[900px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Program</th>
						<th className="px-4 py-3">Batch</th>
						<th className="px-4 py-3">Dates</th>
						<th className="px-4 py-3">Seats</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{batches.map((batch) => (
						<BatchRow key={batch.id} batch={batch} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function BatchRow({ batch }: { batch: AdminBatchSummary }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function toggleHidden() {
		setIsPending(true);
		try {
			await setBatchHidden({
				data: { id: batch.id, hidden: !batch.hidden },
			});
			await router.invalidate();
			toast.success(batch.hidden ? 'Batch is now visible.' : 'Batch hidden.');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Could not update the batch.',
			);
		} finally {
			setIsPending(false);
		}
	}

	async function handleDelete() {
		setIsPending(true);
		try {
			await deleteBatch({ data: { id: batch.id } });
			setConfirmOpen(false);
			await router.invalidate();
			toast.success('Batch deleted.');
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : 'Could not delete the batch.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<tr className="transition-colors hover:bg-muted/30">
			<td className="px-4 py-4 text-muted-foreground">{batch.programTitle}</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">{batch.name}</span>
					<span className="text-muted-foreground text-xs">
						{batch.schedule}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{formatDate(batch.startDate)}
				{batch.endDate ? ` – ${formatDate(batch.endDate)}` : ''}
			</td>
			<td className="px-4 py-4 tabular-nums">
				{batch.seatsTaken} / {batch.capacity}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap gap-1.5">
					<Badge variant="outline" className="text-muted-foreground">
						{STATUS_LABELS[batch.status]}
					</Badge>
					{batch.hidden ? (
						<Badge variant="outline" className="text-muted-foreground">
							Hidden
						</Badge>
					) : null}
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="outline"
						size="sm"
						render={
							<Link
								to="/dashboard/batches/$batchId/edit"
								params={{ batchId: batch.id }}
							/>
						}
					>
						<IconPencil stroke={1.75} />
						Edit
					</Button>

					<Button
						variant="ghost"
						size="icon-sm"
						disabled={isPending}
						onClick={toggleHidden}
						aria-label={batch.hidden ? 'Show batch' : 'Hide batch'}
						title={batch.hidden ? 'Show batch' : 'Hide batch'}
					>
						{batch.hidden ? (
							<IconEye stroke={1.75} />
						) : (
							<IconEyeOff stroke={1.75} />
						)}
					</Button>

					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setConfirmOpen(true)}
							aria-label="Delete batch"
							title="Delete batch"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Delete the {batch.name} batch?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently removes the batch and any applications to it.
									This action cannot be undone.
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
									{isPending ? 'Deleting…' : 'Delete batch'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
