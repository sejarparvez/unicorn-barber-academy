import { IconCertificate, IconSchool } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { StudentCertificate } from '@/server/certificates';

function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function MyCertificatesList({
	certificates,
}: {
	certificates: StudentCertificate[];
}) {
	if (certificates.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
				<IconCertificate
					className="mx-auto size-8 text-primary/70"
					stroke={1.6}
					aria-hidden="true"
				/>
				<p className="mt-4 font-medium text-foreground">No certificates yet.</p>
				<p className="mt-1 text-muted-foreground text-sm">
					Your certificate appears here once you complete a program and the
					academy issues it.
				</p>
				<Button
					className="mt-5"
					variant="outline"
					render={<Link to="/dashboard/my-programs" />}
				>
					<IconSchool stroke={1.75} />
					View my programs
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{certificates.map((certificate) => (
				<Card key={certificate.id}>
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-start justify-between gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary">
								<IconCertificate
									className="size-5"
									stroke={1.6}
									aria-hidden="true"
								/>
							</span>
							{certificate.revokedAt ? (
								<Badge
									variant="outline"
									className="border-destructive/40 text-destructive"
								>
									Revoked
								</Badge>
							) : (
								<Badge
									variant="outline"
									className="border-primary/30 text-primary"
								>
									Valid
								</Badge>
							)}
						</div>

						<div className="flex flex-col gap-1">
							<h2 className="font-semibold text-base tracking-tight">
								{certificate.programTitle}
							</h2>
							<p className="text-muted-foreground text-sm">
								{certificate.batchName} batch
							</p>
						</div>

						<dl className="flex flex-col gap-1.5 border-border/60 border-t pt-3 text-sm">
							<div className="flex items-center justify-between gap-3">
								<dt className="text-muted-foreground text-xs">
									Certificate no.
								</dt>
								<dd className="font-medium tabular-nums">
									{certificate.certificateNo}
								</dd>
							</div>
							<div className="flex items-center justify-between gap-3">
								<dt className="text-muted-foreground text-xs">Issued</dt>
								<dd>{formatDate(certificate.issuedAt)}</dd>
							</div>
						</dl>

						<div className="flex flex-wrap gap-2">
							<Button
								size="sm"
								render={
									<Link
										to="/certificates/$certificateId"
										params={{ certificateId: certificate.id }}
									/>
								}
							>
								View &amp; print
							</Button>
							<Button
								size="sm"
								variant="outline"
								render={
									<Link
										to="/verify"
										search={{ no: certificate.certificateNo }}
									/>
								}
							>
								Verify
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
