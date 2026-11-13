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
	type AdminProgramSummary,
	deleteProgram,
	setProgramHidden,
} from '@/server/admin/programs';

function formatPrice(amount: number) {
	return `৳${amount.toLocaleString('en-US')}`;
}

export function ProgramsTable({
	programs,
}: {
	programs: AdminProgramSummary[];
}) {
	if (programs.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No programs yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Create your first program to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[860px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">#</th>
						<th className="px-4 py-3">Program</th>
						<th className="px-4 py-3">Category</th>
						<th className="px-4 py-3">Price</th>
						<th className="px-4 py-3">Modules</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{programs.map((program) => (
						<ProgramRow key={program.id} program={program} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function ProgramRow({ program }: { program: AdminProgramSummary }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function toggleHidden() {
		setIsPending(true);
		try {
			await setProgramHidden({
				data: { id: program.id, hidden: !program.hidden },
			});
			await router.invalidate();
			toast.success(
				program.hidden ? 'Program is now visible.' : 'Program hidden.',
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not update the program.',
			);
		} finally {
			setIsPending(false);
		}
	}

	async function handleDelete() {
		setIsPending(true);
		try {
			await deleteProgram({ data: { id: program.id } });
			setConfirmOpen(false);
			await router.invalidate();
			toast.success('Program deleted.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not delete the program.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<tr className="transition-colors hover:bg-muted/30">
			<td className="px-4 py-4 font-mono text-muted-foreground text-xs tabular-nums">
				{String(program.position).padStart(2, '0')}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">{program.title}</span>
					<span className="text-muted-foreground text-xs">
						/programs/{program.slug}
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground">{program.category}</td>
			<td className="px-4 py-4 tabular-nums">{formatPrice(program.price)}</td>
			<td className="px-4 py-4 text-muted-foreground tabular-nums">
				{program.moduleCount}
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-wrap gap-1.5">
					{program.hidden ? (
						<Badge variant="outline" className="text-muted-foreground">
							Hidden
						</Badge>
					) : (
						<Badge variant="outline" className="border-primary/30 text-primary">
							Published
						</Badge>
					)}
					{program.featured ? (
						<Badge variant="outline" className="text-muted-foreground">
							Featured
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
								to="/dashboard/programs/$programId/edit"
								params={{ programId: program.id }}
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
						aria-label={program.hidden ? 'Show program' : 'Hide program'}
						title={program.hidden ? 'Show program' : 'Hide program'}
					>
						{program.hidden ? (
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
							aria-label="Delete program"
							title="Delete program"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete “{program.title}”?</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently removes the program and its modules. This
									action cannot be undone.
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
									{isPending ? 'Deleting…' : 'Delete program'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
