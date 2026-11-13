import Logo from '@/assets/logo/logo.png';

export type CertificateSheetData = {
	certificateNo: string;
	studentName: string;
	programTitle: string;
	batchName: string;
	issuedAt: string;
	revoked?: boolean;
};

function formatIssued(iso: string) {
	return new Date(iso).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

export function CertificateSheet({ data }: { data: CertificateSheetData }) {
	return (
		<div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border-2 border-primary/40 bg-card p-8 shadow-sm sm:p-12 print:rounded-none print:border-2 print:shadow-none">
			<div className="pointer-events-none absolute inset-3 rounded-md border border-primary/20" />
			{data.revoked ? (
				<span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 font-semibold text-5xl text-destructive/15 uppercase tracking-[0.3em] sm:text-7xl">
					Revoked
				</span>
			) : null}

			<div className="relative flex flex-col items-center gap-6 text-center">
				<div className="flex flex-col items-center gap-2">
					<img
						src={Logo}
						alt="Unicorn Barber Training Academy"
						className="h-14 w-auto"
						width={550}
						height={454}
					/>
					<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.28em]">
						Unicorn Barber Training Academy
					</p>
				</div>

				<div className="flex flex-col gap-1">
					<h1 className="font-serif font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
						Certificate of Completion
					</h1>
					<p className="text-muted-foreground text-sm">
						This is to certify that
					</p>
				</div>

				<p className="border-primary/30 border-b pb-2 font-serif font-semibold text-3xl text-foreground tracking-tight sm:text-4xl">
					{data.studentName}
				</p>

				<p className="max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
					has successfully completed the{' '}
					<span className="font-medium text-foreground">
						{data.programTitle}
					</span>{' '}
					program in the{' '}
					<span className="font-medium text-foreground">
						{data.batchName} batch
					</span>{' '}
					at Unicorn Barber Training Academy.
				</p>

				<div className="mt-4 grid w-full grid-cols-2 gap-6 text-left sm:grid-cols-3 sm:items-end">
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							Certificate no.
						</span>
						<span className="font-medium text-foreground text-sm tabular-nums">
							{data.certificateNo}
						</span>
					</div>
					<div className="flex flex-col gap-1">
						<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-[0.14em]">
							Issued
						</span>
						<span className="font-medium text-foreground text-sm">
							{formatIssued(data.issuedAt)}
						</span>
					</div>
					<div className="flex flex-col gap-1 sm:items-end">
						<span className="w-40 border-foreground/30 border-t pt-1 text-center font-medium text-foreground text-xs">
							Authorized signature
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
