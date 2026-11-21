import { QRCodeSVG } from 'qrcode.react';
import type { CSSProperties } from 'react';
import Logo from '@/assets/logo/logo.png';
import type { CertificateDesignId, CertificateSampleData } from './designs';

type ArtworkProps = {
	design: CertificateDesignId;
	data: CertificateSampleData;
};

const ROOT_STYLE: CSSProperties = {
	width: '297mm',
	height: '210mm',
	WebkitPrintColorAdjust: 'exact',
	printColorAdjust: 'exact',
};

const ROOT = 'certificate-root relative overflow-hidden break-inside-avoid';
const SCRIPT_FONT = "'Pinyon Script', cursive";

function StudentName({
	name,
	className,
	style,
}: {
	name: string;
	className?: string;
	style?: CSSProperties;
}) {
	return (
		<p
			className={className}
			style={{
				fontFamily: SCRIPT_FONT,
				fontWeight: 400,
				lineHeight: 1.1,
				wordSpacing: '0.38em',
				letterSpacing: '0.02em',
				...style,
			}}
		>
			{name}
		</p>
	);
}

function Rule({ color, width = '46mm' }: { color: string; width?: string }) {
	return (
		<span
			className="block h-px"
			style={{
				width,
				background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
			}}
		/>
	);
}

/** Soft unicorn logo watermark used across every design. */
function Watermark({
	opacity = 0.055,
	filter,
}: {
	opacity?: number;
	filter?: string;
}) {
	return (
		<img
			src={Logo}
			alt=""
			className="pointer-events-none absolute top-1/2 left-1/2 w-[108mm]"
			style={{
				opacity,
				filter,
				transform: 'translate(-50%, -50%) rotate(-12deg)',
			}}
		/>
	);
}

function OrnateDivider({
	color,
	width = '40mm',
}: {
	color: string;
	width?: string;
}) {
	return (
		<div
			className="flex items-center justify-center gap-[6px]"
			style={{ width }}
		>
			<span
				className="h-px flex-1"
				style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
			/>
			<span
				className="h-[5px] w-[5px] rotate-45"
				style={{ background: color }}
			/>
			<span
				className="h-px flex-1"
				style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
			/>
		</div>
	);
}

/** Gold-foil gradient for titles on dark certificates. */
function foilText(highlight: string, base: string): CSSProperties {
	return {
		background: `linear-gradient(180deg, #fff4cf 0%, ${highlight} 42%, ${base} 100%)`,
		WebkitBackgroundClip: 'text',
		backgroundClip: 'text',
		color: 'transparent',
	};
}

/** Framed tag for certificate ID / issue date, as used in top-ranked templates. */
function FramedMeta({
	label,
	value,
	color,
	borderColor,
}: {
	label: string;
	value: string;
	color: string;
	borderColor: string;
}) {
	return (
		<div
			className="flex flex-col gap-[3px] rounded-[3px] border px-[8px] py-[6px]"
			style={{ borderColor }}
		>
			<span
				className="text-[7px] font-semibold uppercase tracking-[0.18em]"
				style={{ color, opacity: 0.8 }}
			>
				{label}
			</span>
			<span
				className="text-[10.5px] font-semibold tracking-[0.03em]"
				style={{ color }}
			>
				{value}
			</span>
		</div>
	);
}

function AcademyMark({
	tone,
	filter,
	align = 'center',
}: {
	tone: string;
	filter?: string;
	align?: 'center' | 'left';
}) {
	return (
		<div
			className={`flex flex-col gap-2 ${align === 'left' ? 'items-start text-left' : 'items-center text-center'}`}
		>
			<img
				src={Logo}
				alt=""
				className="h-[17mm] w-auto"
				style={filter ? { filter } : undefined}
			/>
			<span
				className="text-[8px] font-bold uppercase tracking-[0.3em]"
				style={{ color: tone }}
			>
				Unicorn Barber Training Academy
			</span>
		</div>
	);
}

function Verification({ url }: { url: string; tone?: string }) {
	return (
		<div className="mt-[3mm] w-fit">
			<div className="w-fit rounded-[3px] bg-white p-[3px]">
				<QRCodeSVG
					value={url}
					size={62}
					marginSize={1}
					level="M"
					bgColor="#ffffff"
					fgColor="#101014"
				/>
			</div>
		</div>
	);
}

function MetaItem({
	label,
	value,
	labelColor,
	valueColor,
}: {
	label: string;
	value: string;
	labelColor: string;
	valueColor: string;
}) {
	return (
		<div className="flex flex-col gap-[3px]">
			<span
				className="text-[7.5px] font-semibold uppercase tracking-[0.2em]"
				style={{ color: labelColor }}
			>
				{label}
			</span>
			<span
				className="text-[11px] font-semibold tracking-[0.03em]"
				style={{ color: valueColor }}
			>
				{value}
			</span>
		</div>
	);
}

function SignatureLine({
	label,
	tone,
	lineColor,
}: {
	label: string;
	tone: string;
	lineColor: string;
}) {
	return (
		<div className="flex flex-col items-center text-center">
			<span className="block h-px w-[44mm]" style={{ background: lineColor }} />
			<span
				className="mt-[4px] text-[8px] font-semibold uppercase tracking-[0.18em]"
				style={{ color: tone }}
			>
				{label}
			</span>
		</div>
	);
}

function CourseCopy({
	data,
	className,
}: {
	data: CertificateSampleData;
	className: string;
}) {
	return (
		<p className={className}>
			has successfully completed the{' '}
			<strong className="font-semibold">{data.programTitle}</strong>, a{' '}
			<strong className="font-semibold">{data.duration}</strong> course covering
			barbering foundations, hygiene and infection control, consultation,
			cutting, fading, shaving, beard design and professional barbering
			practice, in the{' '}
			<strong className="font-semibold">{data.batchName}</strong> at Unicorn
			Barber Training Academy.
		</p>
	);
}

function BlackGoldCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#fffaf0]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 50% 0%, rgba(231,195,106,0.10), transparent 45%), linear-gradient(145deg, #0c0c0e 0%, #151518 55%, #0c0c0e 100%)',
			}}
		>
			<Watermark opacity={0.06} />
			<div className="pointer-events-none absolute inset-[5mm] border-[1.6px] border-[#e7c36a]" />
			<div className="pointer-events-none absolute inset-[8mm] border border-[#e7c36a]/40" />

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[16mm] pb-[13mm] text-center">
				<AcademyMark tone="#e7c36a" />

				<div className="mt-[6mm] flex flex-col items-center gap-[5px]">
					<Rule color="#e7c36a" />
					<h2
						className="font-serif text-[29px] font-semibold uppercase tracking-[0.13em]"
						style={foilText('#f4d98f', '#a97c2e')}
					>
						Certificate of Completion
					</h2>
					<p className="text-[10px] uppercase tracking-[0.18em] text-[#cfc6b4]">
						Barbering · Professional Training
					</p>
				</div>

				<p className="mt-[6mm] text-[11px] tracking-[0.08em] text-[#cfc6b4]">
					This is to certify that
				</p>
				<StudentName
					name={data.studentName}
					className="mt-[2mm] text-[38px] text-[#fffaf0]"
				/>
				<span
					className="mt-[3px] block h-px w-[96mm]"
					style={{
						background:
							'linear-gradient(90deg, transparent, #e7c36a 20%, #e7c36a 80%, transparent)',
					}}
				/>

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[12px] leading-[1.7] text-[#ded6c6]"
				/>
				<div className="mt-[4mm] flex justify-center">
					<OrnateDivider color="#e7c36a" width="54mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<MetaItem
							label="Certificate no."
							value={data.certificateNo}
							labelColor="#a99f8d"
							valueColor="#f1e9d8"
						/>
						<MetaItem
							label="Issued"
							value={data.issuedAt}
							labelColor="#a99f8d"
							valueColor="#f1e9d8"
						/>
						<Verification url={data.verifyUrl} tone="#e7c36a" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#f4d98f"
						lineColor="rgba(231,195,106,0.45)"
					/>
					<SignatureLine
						label="Manager"
						tone="#f4d98f"
						lineColor="rgba(231,195,106,0.45)"
					/>
				</div>
			</div>
		</div>
	);
}

function IvoryGoldCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#2b2418]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 50% 0%, rgba(166,124,46,0.10), transparent 50%), linear-gradient(180deg, #fffaf0 0%, #f7f1e3 100%)',
			}}
		>
			<Watermark opacity={0.05} />
			<div className="absolute inset-x-0 top-0 h-[2mm] bg-[#a67c2e]" />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#a67c2e]" />
			<div className="pointer-events-none absolute inset-[9mm] border border-[#a67c2e]/45" />

			<div className="relative flex h-full flex-col items-center px-[19mm] pt-[15mm] pb-[12mm] text-center">
				<AcademyMark tone="#6f5320" filter="brightness(0.72) sepia(0.35)" />

				<div className="mt-[5mm] flex flex-col items-center gap-[4px]">
					<h2
						className="font-serif text-[28px] font-semibold uppercase tracking-[0.1em]"
						style={{ color: '#3a2c17' }}
					>
						Certificate of Completion
					</h2>
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#7a6a4f]">
						This certifies that
					</p>
					<OrnateDivider color="#a67c2e" width="38mm" />
				</div>

				<StudentName
					name={data.studentName}
					className="mt-[5mm] text-[38px] text-[#2b2418]"
				/>
				<span className="mt-[3px] block h-px w-[92mm] bg-[#a67c2e]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[12px] leading-[1.7] text-[#5a4f3c]"
				/>

				<div className="mt-[5mm] flex justify-center">
					<OrnateDivider color="#a67c2e" width="52mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<MetaItem
							label="Certificate no."
							value={data.certificateNo}
							labelColor="#8a7a5e"
							valueColor="#3a2c17"
						/>
						<MetaItem
							label="Issued"
							value={data.issuedAt}
							labelColor="#8a7a5e"
							valueColor="#3a2c17"
						/>
						<Verification url={data.verifyUrl} tone="#6f5320" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#6f5320"
						lineColor="rgba(166,124,46,0.5)"
					/>
					<SignatureLine
						label="Manager"
						tone="#6f5320"
						lineColor="rgba(166,124,46,0.5)"
					/>
				</div>
			</div>
		</div>
	);
}

function NavyGoldCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#f2ead7]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 85% 10%, rgba(217,182,106,0.12), transparent 42%), linear-gradient(145deg, #0d1b2a 0%, #11243a 60%, #0d1b2a 100%)',
			}}
		>
			<Watermark opacity={0.05} />
			<div className="absolute inset-y-0 left-0 w-[9mm] bg-[#d9b66a]" />
			<div className="absolute inset-y-0 left-[9mm] w-px bg-[#d9b66a]/50" />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#d9b66a]/50" />

			<div className="relative flex h-full flex-col pl-[28mm] pr-[18mm] pt-[15mm] pb-[12mm]">
				<AcademyMark tone="#d9b66a" align="left" />

				<div className="mt-[6mm] flex flex-col items-start gap-[5px]">
					<h2
						className="font-serif text-[31px] font-semibold uppercase leading-[1.05] tracking-[0.08em]"
						style={foilText('#f4dfad', '#9a7430')}
					>
						Certificate
						<br />
						of Completion
					</h2>
					<div className="flex justify-start">
						<OrnateDivider color="#d9b66a" width="62mm" />
					</div>
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#aebfd2]">
						Barbering · Professional Training
					</p>
				</div>

				<p className="mt-[6mm] text-[10.5px] tracking-[0.1em] text-[#aebfd2]">
					This is to certify that
				</p>
				<StudentName
					name={data.studentName}
					className="mt-[2mm] text-[37px] text-[#fffaf0]"
				/>
				<span className="mt-[3px] block h-px w-[88mm] bg-[#d9b66a]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[188mm] text-[11.5px] leading-[1.65] text-[#cbd6e2] text-left"
				/>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<FramedMeta
							label="Certificate no."
							value={data.certificateNo}
							color="#f2ead7"
							borderColor="rgba(217,182,106,0.5)"
						/>
						<FramedMeta
							label="Issued"
							value={data.issuedAt}
							color="#f2ead7"
							borderColor="rgba(217,182,106,0.5)"
						/>
						<Verification url={data.verifyUrl} tone="#d9b66a" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#f4dfad"
						lineColor="rgba(217,182,106,0.45)"
					/>
					<SignatureLine
						label="Manager"
						tone="#f4dfad"
						lineColor="rgba(217,182,106,0.45)"
					/>
				</div>
			</div>
		</div>
	);
}

function EmeraldGoldCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#f6f1e2]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 50% 0%, rgba(217,182,106,0.14), transparent 45%), linear-gradient(160deg, #0d2a20 0%, #144635 55%, #0d2a20 100%)',
			}}
		>
			<Watermark opacity={0.06} />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#d9b66a]/70" />
			<div className="pointer-events-none absolute inset-[9mm] border border-[#d9b66a]/35" />

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[16mm] pb-[13mm] text-center">
				<AcademyMark tone="#d9b66a" />

				<div className="mt-[6mm] flex flex-col items-center gap-[4px]">
					<Rule color="#d9b66a" />
					<h2
						className="font-serif text-[28px] font-semibold uppercase tracking-[0.12em]"
						style={foilText('#f4dfad', '#9a7430')}
					>
						Certificate of Completion
					</h2>
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#bcd2c4]">
						Barbering · Professional Training
					</p>
				</div>

				<p className="mt-[6mm] text-[10.5px] tracking-[0.1em] text-[#bcd2c4]">
					This is to certify that
				</p>
				<StudentName
					name={data.studentName}
					className="mt-[2mm] text-[38px] text-[#fffdf6]"
				/>
				<span className="mt-[3px] block h-px w-[94mm] bg-[#d9b66a]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[11.5px] leading-[1.7] text-[#dbe8df]"
				/>

				<div className="mt-[4mm] flex justify-center">
					<OrnateDivider color="#d9b66a" width="50mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<MetaItem
							label="Certificate no."
							value={data.certificateNo}
							labelColor="#9cb9a9"
							valueColor="#f6f1e2"
						/>
						<MetaItem
							label="Issued"
							value={data.issuedAt}
							labelColor="#9cb9a9"
							valueColor="#f6f1e2"
						/>
						<Verification url={data.verifyUrl} tone="#d9b66a" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#f4dfad"
						lineColor="rgba(217,182,106,0.45)"
					/>
					<SignatureLine
						label="Manager"
						tone="#f4dfad"
						lineColor="rgba(217,182,106,0.45)"
					/>
				</div>
			</div>
		</div>
	);
}

function BurgundyCreamCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#f8ecd8]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 50% 10%, rgba(217,176,106,0.14), transparent 45%), linear-gradient(150deg, #4a1420 0%, #6b1f2e 55%, #4a1420 100%)',
			}}
		>
			<Watermark opacity={0.06} />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#d9b06a]/70" />
			<div className="pointer-events-none absolute inset-[9mm] border border-[#d9b06a]/35" />

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[16mm] pb-[13mm] text-center">
				<AcademyMark tone="#e6c48a" />

				<div className="mt-[5mm] flex flex-col items-center gap-[4px]">
					<h2
						className="font-serif text-[29px] font-semibold uppercase tracking-[0.1em]"
						style={foilText('#f6e3c4', '#9a6a3a')}
					>
						Certificate of Completion
					</h2>
					<OrnateDivider color="#d9b06a" width="40mm" />
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#e2c6b0]">
						This certifies that
					</p>
				</div>

				<StudentName
					name={data.studentName}
					className="mt-[5mm] text-[38px] text-[#fff7e8]"
				/>
				<span
					className="mt-[3px] block h-px w-[96mm]"
					style={{
						background:
							'linear-gradient(90deg, transparent, #d9b06a 20%, #d9b06a 80%, transparent)',
					}}
				/>

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[11.5px] leading-[1.7] text-[#f0dcc8]"
				/>

				<div className="mt-[5mm] flex justify-center">
					<OrnateDivider color="#d9b06a" width="52mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<MetaItem
							label="Certificate no."
							value={data.certificateNo}
							labelColor="#cfab98"
							valueColor="#f8ecd8"
						/>
						<MetaItem
							label="Issued"
							value={data.issuedAt}
							labelColor="#cfab98"
							valueColor="#f8ecd8"
						/>
						<Verification url={data.verifyUrl} tone="#e6c48a" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#f6e3c4"
						lineColor="rgba(217,176,106,0.5)"
					/>
					<SignatureLine
						label="Manager"
						tone="#f6e3c4"
						lineColor="rgba(217,176,106,0.5)"
					/>
				</div>
			</div>
		</div>
	);
}

function WhiteGoldCertificate({ data }: { data: CertificateSampleData }) {
	return (
		<div
			className={`${ROOT} text-[#22201c]`}
			style={{
				...ROOT_STYLE,
				background: 'linear-gradient(180deg, #ffffff 0%, #fbfaf7 100%)',
			}}
		>
			<Watermark opacity={0.045} />
			<div className="absolute inset-x-0 top-0 h-[2mm] bg-[#b8934f]" />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#b8934f]" />
			<div className="pointer-events-none absolute inset-[9mm] border border-[#b8934f]/40" />

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[16mm] pb-[13mm] text-center">
				<AcademyMark tone="#7a5f2e" filter="brightness(0.7) sepia(0.4)" />

				<div className="mt-[6mm] flex flex-col items-center gap-[4px]">
					<Rule color="#b8934f" />
					<h2
						className="font-serif text-[28px] font-semibold uppercase tracking-[0.12em]"
						style={{ color: '#22201c' }}
					>
						Certificate of Completion
					</h2>
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#8a8274]">
						Barbering · Professional Training
					</p>
					<OrnateDivider color="#b8934f" width="40mm" />
				</div>

				<p className="mt-[6mm] text-[10.5px] tracking-[0.1em] text-[#8a8274]">
					This is to certify that
				</p>
				<StudentName
					name={data.studentName}
					className="mt-[2mm] text-[38px] text-[#1c1a17]"
				/>
				<span className="mt-[3px] block h-px w-[94mm] bg-[#b8934f]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[11.5px] leading-[1.7] text-[#5f5a50]"
				/>

				<div className="mt-[4mm] flex justify-center">
					<OrnateDivider color="#b8934f" width="50mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<MetaItem
							label="Certificate no."
							value={data.certificateNo}
							labelColor="#9a9284"
							valueColor="#22201c"
						/>
						<MetaItem
							label="Issued"
							value={data.issuedAt}
							labelColor="#9a9284"
							valueColor="#22201c"
						/>
						<Verification url={data.verifyUrl} tone="#7a5f2e" />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#7a5f2e"
						lineColor="rgba(184,147,79,0.5)"
					/>
					<SignatureLine
						label="Manager"
						tone="#7a5f2e"
						lineColor="rgba(184,147,79,0.5)"
					/>
				</div>
			</div>
		</div>
	);
}

function FormalDiplomaCertificate({ data }: { data: CertificateSampleData }) {
	const ink = '#2b2b2b';

	return (
		<div
			className={`${ROOT} text-[#232323]`}
			style={{
				...ROOT_STYLE,
				background: 'linear-gradient(180deg, #fdfdfc 0%, #f4f4f2 100%)',
			}}
		>
			<Watermark opacity={0.04} filter="grayscale(1)" />
			<div
				className="pointer-events-none absolute inset-[5mm] border-[1.8px]"
				style={{ borderColor: ink }}
			/>
			<div
				className="pointer-events-none absolute inset-[8mm] border"
				style={{ borderColor: `${ink}77` }}
			/>

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[15mm] pb-[12mm] text-center">
				<AcademyMark tone={ink} filter="grayscale(1)" />

				<div className="mt-[5mm] flex flex-col items-center gap-[4px]">
					<h2
						className="font-serif text-[27px] font-semibold uppercase tracking-[0.14em]"
						style={{ fontFamily: 'Georgia, serif', color: ink }}
					>
						Certificate of Completion
					</h2>
					<OrnateDivider color={ink} width="44mm" />
					<p className="text-[9px] uppercase tracking-[0.22em] text-[#6a6a6a]">
						This is to certify that
					</p>
				</div>

				<StudentName
					name={data.studentName}
					className="mt-[5mm] text-[37px]"
					style={{ color: '#1a1a1a' }}
				/>
				<span className="mt-[3px] block h-px w-[92mm] bg-[#2b2b2b]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[11.5px] leading-[1.7] text-[#4a4a4a]"
				/>

				<div className="mt-[4mm] flex justify-center">
					<OrnateDivider color={ink} width="50mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<FramedMeta
							label="Certificate no."
							value={data.certificateNo}
							color={ink}
							borderColor={`${ink}66`}
						/>
						<FramedMeta
							label="Issued"
							value={data.issuedAt}
							color={ink}
							borderColor={`${ink}66`}
						/>
						<Verification url={data.verifyUrl} tone={ink} />
					</div>

					<SignatureLine label="Chairman" tone={ink} lineColor={`${ink}66`} />
					<SignatureLine label="Manager" tone={ink} lineColor={`${ink}66`} />
				</div>
			</div>
		</div>
	);
}

function LaurelAwardCertificate({ data }: { data: CertificateSampleData }) {
	const gold = '#e3c274';

	return (
		<div
			className={`${ROOT} text-[#fff8e8]`}
			style={{
				...ROOT_STYLE,
				background:
					'radial-gradient(circle at 50% 5%, rgba(227,194,116,0.18), transparent 45%), linear-gradient(150deg, #12352a 0%, #1d513c 55%, #12352a 100%)',
			}}
		>
			<Watermark opacity={0.055} />
			<div className="pointer-events-none absolute inset-[6mm] border border-[#e3c274]/80" />
			<div className="pointer-events-none absolute inset-[9mm] border border-[#e3c274]/35" />

			<div className="relative flex h-full flex-col items-center px-[20mm] pt-[15mm] pb-[12mm] text-center">
				<AcademyMark tone={gold} />

				<div className="mt-[5mm] flex flex-col items-center gap-[4px]">
					<h2
						className="font-serif text-[28px] font-semibold uppercase tracking-[0.12em]"
						style={foilText('#fff0c4', '#9a7430')}
					>
						Certificate of Completion
					</h2>
					<p className="text-[9.5px] uppercase tracking-[0.2em] text-[#bcd2c4]">
						Barbering · Professional Training
					</p>
					<span
						className="rounded-full border px-[10px] py-[3px] text-[8px] font-bold uppercase tracking-[0.2em]"
						style={{ color: gold, borderColor: `${gold}99` }}
					>
						Award of Excellence
					</span>
				</div>

				<p className="mt-[5mm] text-[10.5px] tracking-[0.1em] text-[#bcd2c4]">
					This is to certify that
				</p>
				<StudentName
					name={data.studentName}
					className="mt-[2mm] text-[37px] text-[#fffaf0]"
					style={{ textShadow: '0 0 18px rgba(227,194,116,0.25)' }}
				/>
				<span className="mt-[3px] block h-px w-[94mm] bg-[#e3c274]" />

				<CourseCopy
					data={data}
					className="mt-[5mm] max-w-[190mm] text-[11.5px] leading-[1.7] text-[#dbe8df]"
				/>

				<div className="mt-[4mm] flex justify-center">
					<OrnateDivider color={gold} width="52mm" />
				</div>

				<div className="mt-auto grid w-full grid-cols-3 items-end gap-[6mm] [&>*:first-child]:order-2 [&>*:nth-child(2)]:order-3 [&>*:nth-child(3)]:order-1">
					<div className="flex flex-col items-center gap-[6px] text-center">
						<FramedMeta
							label="Certificate no."
							value={data.certificateNo}
							color="#fff8e8"
							borderColor={`${gold}77`}
						/>
						<FramedMeta
							label="Issued"
							value={data.issuedAt}
							color="#fff8e8"
							borderColor={`${gold}77`}
						/>
						<Verification url={data.verifyUrl} tone={gold} />
					</div>

					<SignatureLine
						label="Chairman"
						tone="#fff0c4"
						lineColor={`${gold}66`}
					/>
					<SignatureLine
						label="Manager"
						tone="#fff0c4"
						lineColor={`${gold}66`}
					/>
				</div>
			</div>
		</div>
	);
}

export function CertificateArtwork({ design, data }: ArtworkProps) {
	if (design === 'formal-diploma') {
		return <FormalDiplomaCertificate data={data} />;
	}

	if (design === 'laurel-award') {
		return <LaurelAwardCertificate data={data} />;
	}

	if (design === 'ivory-gold') {
		return <IvoryGoldCertificate data={data} />;
	}

	if (design === 'navy-gold') {
		return <NavyGoldCertificate data={data} />;
	}

	if (design === 'emerald-gold') {
		return <EmeraldGoldCertificate data={data} />;
	}

	if (design === 'burgundy-cream') {
		return <BurgundyCreamCertificate data={data} />;
	}

	if (design === 'white-gold') {
		return <WhiteGoldCertificate data={data} />;
	}

	return <BlackGoldCertificate data={data} />;
}
