import {
	IconExternalLink,
	IconRosetteDiscountCheck,
	IconTrash,
	IconX,
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
	type AdminCertificate,
	deleteCertificate,
	setCertificateRevoked,
} from '@/server/admin/certificates';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function CertificatesTable({
	certificates,
}: {
	certificates: AdminCertificate[];
}) {
	if (certificates.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center">
				<p className="font-medium text-sm">No certificates issued yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Issued certificates appear here with their verification number.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<table className="w-full min-w-[900px] text-left text-sm">
				<thead className="border-border/60 border-b bg-muted/40 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
					<tr>
						<th className="px-4 py-3">Certificate no.</th>
						<th className="px-4 py-3">Student</th>
						<th className="px-4 py-3">Program &amp; batch</th>
						<th className="px-4 py-3">Issued</th>
						<th className="px-4 py-3">Status</th>
						<th className="px-4 py-3 text-right">Actions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border/60">
					{certificates.map((certificate) => (
						<CertificateRow key={certificate.id} certificate={certificate} />
					))}
				</tbody>
			</table>
		</div>
	);
}

function CertificateRow({ certificate }: { certificate: AdminCertificate }) {
	const router = useRouter();
	const [isPending, setIsPending] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const isRevoked = certificate.revokedAt !== null;

	async function toggleRevoked() {
		setIsPending(true);
		try {
			await setCertificateRevoked({
				data: { id: certificate.id, revoked: !isRevoked },
			});
			await router.invalidate();
			toast.success(
				isRevoked ? 'Certificate reinstated.' : 'Certificate revoked.',
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not update the certificate.',
			);
		} finally {
			setIsPending(false);
		}
	}

	async function handleDelete() {
		setIsPending(true);
		try {
			await deleteCertificate({ data: { id: certificate.id } });
			setConfirmOpen(false);
			await router.invalidate();
			toast.success('Certificate deleted.');
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: 'Could not delete the certificate.',
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<tr className="align-top transition-colors hover:bg-muted/30">
			<td className="px-4 py-4">
				<Link
					to="/verify"
					search={{ no: certificate.certificateNo }}
					className="inline-flex items-center gap-1.5 font-medium text-foreground text-sm tabular-nums hover:text-primary"
				>
					{certificate.certificateNo}
					<IconExternalLink
						className="size-3.5 text-muted-foreground"
						stroke={1.75}
						aria-hidden="true"
					/>
				</Link>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{certificate.studentName}
					</span>
					<span className="text-muted-foreground text-xs">
						{certificate.admissionNo ?? certificate.studentEmail}
					</span>
				</div>
			</td>
			<td className="px-4 py-4">
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-foreground">
						{certificate.programTitle}
					</span>
					<span className="text-muted-foreground text-xs">
						{certificate.batchName} batch
					</span>
				</div>
			</td>
			<td className="px-4 py-4 text-muted-foreground text-xs">
				{formatDate(certificate.issuedAt)}
				{certificate.issuedByName ? (
					<span className="block">by {certificate.issuedByName}</span>
				) : null}
			</td>
			<td className="px-4 py-4">
				{isRevoked ? (
					<Badge
						variant="outline"
						className="border-destructive/40 text-destructive"
					>
						Revoked
					</Badge>
				) : (
					<Badge variant="outline" className="border-primary/30 text-primary">
						Valid
					</Badge>
				)}
			</td>
			<td className="px-4 py-4">
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="outline"
						size="sm"
						disabled={isPending}
						onClick={() => void toggleRevoked()}
					>
						{isRevoked ? (
							<IconRosetteDiscountCheck stroke={1.75} />
						) : (
							<IconX stroke={1.75} />
						)}
						{isRevoked ? 'Reinstate' : 'Revoke'}
					</Button>

					<AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<Button
							variant="ghost"
							size="icon-sm"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={() => setConfirmOpen(true)}
							aria-label="Delete certificate"
							title="Delete certificate"
						>
							<IconTrash stroke={1.75} />
						</Button>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>
									Delete {certificate.certificateNo}?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This permanently removes the certificate for{' '}
									{certificate.studentName}. The number will no longer verify.
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
									{isPending ? 'Deleting…' : 'Delete certificate'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	);
}
