import { IconAlertTriangle, IconCertificate } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
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
import { formatTaka } from '@/lib/utils';
import {
	type CertificateCandidate,
	issueCertificate,
} from '@/server/admin/certificates';

function formatDate(iso: string | null) {
	if (!iso) {
		return '—';
	}
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function CertificateCandidates({
	candidates,
}: {
	candidates: CertificateCandidate[];
}) {
	if (candidates.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-10 text-center">
				<p className="font-medium text-sm">No students are ready yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Students appear here once their enrolment is marked completed.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[820px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Student</th>
						<th className="px-4 py-3">Program &amp; batch</th>
						<th className="px-4 py-3">Completed</th>
						<th className="px-4 py-3">Fees</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{candidates.map((candidate) => (
						<CandidateRow key={candidate.enrollmentId} candidate={candidate} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function CandidateRow({ candidate }: { candidate: CertificateCandidate }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	async function handleIssue() {
		setIsPending(true);
		try {
			const certificate = await issueCertificate({
				data: { enrollmentId: candidate.enrollmentId },
			});
			setConfirmOpen(false);
			await router.invalidate();
			toast.success(`Certificate ${certificate.certificateNo} issued.`);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not issue the certificate.',
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
						{candidate.studentName}
					</span>
					<span className="text-muted-foreground text-xs">
						{candidate.admissionNo ?? candidate.studentEmail}
					</span>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{candidate.programTitle}
					</span>
					<span className="text-muted-foreground text-xs">
						{candidate.batchName} batch
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{formatDate(candidate.completedAt)}
			</td>
			<td className="px-4 py-4">
				{candidate.balance > 0 ? (
					<Badge
						variant="outline"
						className="border-destructive/40 text-destructive"
					>
						{formatTaka(candidate.balance)} due
					</Badge>
				) : (
					<Badge variant="outline" className="border-primary/30 text-primary">
						Paid
					</Badge>
				)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-end">
					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							size="sm"
							disabled={isPending}
							onClick={() => setConfirmOpen(true)}
						>
							<IconCertificate stroke={1.75} />
							Issue
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Issue certificate to {candidate.studentName}?
								</AlertDialogTitle>
								<AlertDialogDescription>
									A certificate for {candidate.programTitle} (
									{candidate.batchName} batch) will be generated with the next
									available certificate number.
								</AlertDialogDescription>
							</AlertDialogHeader>
							{candidate.balance > 0 ? (
								<div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-destructive text-sm">
									<IconAlertTriangle
										className="mt-0.5 size-4 shrink-0"
										stroke={1.75}
										aria-hidden="true"
									/>
									<span>
										This student still owes {formatTaka(candidate.balance)}. You
										can issue the certificate anyway.
									</span>
								</div>
							) : null}
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isPending}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={(event) => {
										event.preventDefault();
										void handleIssue();
									}}
									disabled={isPending}
								>
									{isPending ? 'Issuing…' : 'Issue certificate'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
