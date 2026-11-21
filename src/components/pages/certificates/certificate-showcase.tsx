import { IconPrinter } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CertificateArtwork } from './certificate-artwork';
import {
	CERTIFICATE_DESIGNS,
	type CertificateDesignId,
	type CertificateSampleData,
	SAMPLE_CERTIFICATE,
} from './designs';

/** 297mm at 96dpi. Preview scales down; printing always uses real A4. */
const PRINT_WIDTH_PX = 1122.52;
const PRINT_HEIGHT_PX = 793.7;

const PRINT_STYLE = `
	@page { size: A4 landscape; margin: 0; }
	html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
	body * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
	.certificate-root { break-inside: avoid; page-break-inside: avoid; }
`;

function PrintableCertificate({
	design,
	name,
	data,
}: {
	design: CertificateDesignId;
	name: string;
	data: CertificateSampleData;
}) {
	const [scale, setScale] = useState(1);
	const previewRef = useRef<HTMLDivElement>(null);
	const printRef = useRef<HTMLDivElement>(null);

	const handlePrint = useReactToPrint({
		contentRef: printRef,
		documentTitle: `${name.replace(/\s+/g, '-').toLowerCase()}-certificate`,
		pageStyle: PRINT_STYLE,
	});

	useEffect(() => {
		const preview = previewRef.current;
		if (!preview) {
			return;
		}

		const update = () => {
			setScale(Math.min(1, (preview.clientWidth - 4) / PRINT_WIDTH_PX));
		};

		update();

		const observer = new ResizeObserver(update);
		observer.observe(preview);
		return () => observer.disconnect();
	}, []);

	return (
		<section className="flex flex-col gap-3">
			<div className="flex justify-end px-1">
				<button
					type="button"
					onClick={handlePrint}
					title={`Print ${name} certificate`}
					aria-label={`Print ${name} certificate`}
					className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-white px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.16em] transition-colors hover:border-primary/40 hover:text-primary"
				>
					<IconPrinter className="size-3.5" stroke={1.8} />
					Print
				</button>
			</div>

			<div
				ref={previewRef}
				className="w-full overflow-hidden rounded-xl border border-border/70 bg-muted/10 p-2 shadow-sm"
			>
				<div
					style={{
						width: PRINT_WIDTH_PX * scale,
						height: PRINT_HEIGHT_PX * scale,
					}}
				>
					<div
						style={{
							transform: `scale(${scale})`,
							transformOrigin: 'top left',
						}}
					>
						<div ref={printRef}>
							<CertificateArtwork design={design} data={data} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function CertificateShowcase() {
	return (
		<main className="min-h-svh bg-white px-4 py-10 sm:px-6 lg:px-10">
			<div className="mx-auto flex max-w-[1200px] flex-col items-center gap-10">
				<h1 className="font-serif text-2xl font-semibold tracking-[0.18em] text-foreground">
					{SAMPLE_CERTIFICATE.certificateNo}
				</h1>

				<div className="flex w-full flex-col gap-12">
					{CERTIFICATE_DESIGNS.map((design) => (
						<PrintableCertificate
							key={design.id}
							design={design.id}
							name={design.name}
							data={SAMPLE_CERTIFICATE}
						/>
					))}
				</div>
			</div>
		</main>
	);
}
