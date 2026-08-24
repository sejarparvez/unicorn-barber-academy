// routes/certificates.$id.print.tsx
// Printable certificate (browser Print → PDF). Lives outside /dashboard so
// the dashboard chrome never prints; the site header/footer opt out via
// print:hidden. Ownership is enforced by getMyCertificateFn.
import { IconPrinter } from "@tabler/icons-react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import logo from "@/assets/logo/logo.png";
import { CONTACT } from "@/data/site";
import { COHORT_LABELS } from "@/lib/enrollment";
import { APP_ORIGIN } from "@/lib/env";
import { getMyCertificateFn } from "@/server/certificate-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/certificates/$id/print")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
	},
	loader: async ({ params }) => {
		const id = Number.parseInt(params.id, 10);
		const certificate = Number.isInteger(id)
			? await getMyCertificateFn({ data: { id } })
			: null;
		if (!certificate) throw notFound();

		const { default: QRCode } = await import("qrcode");
		const verifyUrl = `${APP_ORIGIN}/verify/${certificate.code}`;
		const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
			margin: 1,
			width: 240,
			color: { dark: "#1c1c1a", light: "#ffffff" },
		});
		return { certificate, qrDataUrl, verifyUrl };
	},
	head: () => ({
		meta: [
			{ title: "Certificate | Unicorn Barber Training Academy" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: CertificatePrintPage,
});

function formatLongDate(value: string) {
	return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function CertificatePrintPage() {
	const { certificate, qrDataUrl, verifyUrl } = Route.useLoaderData();
	const revoked = Boolean(certificate.revokedAt);

	return (
		<main className="min-h-[calc(100svh-4rem)] bg-muted/25 px-4 py-10 print:block print:min-h-0 print:bg-white print:p-0">
			<div className="mx-auto mb-6 flex max-w-[820px] items-center justify-between print:hidden">
				<p className="text-sm text-muted-foreground">
					Use your browser&rsquo;s print dialog and choose{" "}
					<strong>Save as PDF</strong> (A4, portrait, margins: default).
				</p>
				<button
					type="button"
					onClick={() => window.print()}
					className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
				>
					<IconPrinter className="h-4 w-4" stroke={1.75} />
					Print
				</button>
			</div>

			<article
				aria-label={`Certificate ${certificate.code}`}
				className="relative mx-auto max-w-[820px] border-[3px] border-[#c9a227] bg-white p-10 text-center text-[#1c1c1a] shadow-lg print:max-w-none print:border-2 print:shadow-none sm:p-14"
			>
				{/* Inner hairline frame */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-2 border border-[#c9a227]/50"
				/>

				<header className="flex flex-col items-center gap-3">
					<img
						src={logo}
						alt="Unicorn Barber Training Academy logo"
						className="h-16 w-16 object-contain"
					/>
					<div>
						<p className="text-lg font-bold tracking-[0.22em] text-primary uppercase">
							Unicorn
						</p>
						<p className="text-[10px] tracking-[0.34em] text-[#5b5648] uppercase">
							Barber Training Academy
						</p>
					</div>
				</header>

				<h1 className="mt-8 font-serif text-4xl font-medium tracking-wide print:mt-10">
					Certificate of Completion
				</h1>

				<p className="mt-6 text-sm tracking-[0.18em] text-[#8a8474] uppercase">
					This certifies that
				</p>

				<p className="mt-3 font-serif text-4xl font-semibold break-words text-balance">
					{certificate.holderName}
				</p>

				<p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#3d3a32]">
					has successfully completed the training program
				</p>

				<p className="mt-2 font-serif text-2xl font-semibold text-primary">
					{certificate.programTitle ?? certificate.programSlug}
				</p>
				<p className="mt-1 text-sm text-[#5b5648]">
					{COHORT_LABELS[certificate.cohort]} · Issued{" "}
					{formatLongDate(certificate.issuedOn)}
				</p>

				{revoked ? (
					<p className="mt-6 inline-block rotate-[-4deg] border-2 border-red-700 px-6 py-1 font-serif text-xl font-bold tracking-[0.3em] text-red-700 uppercase">
						Revoked
					</p>
				) : null}

				<footer className="mt-12 flex items-end justify-between gap-8 text-left print:mt-16">
					<div className="max-w-[55%]">
						<div className="min-w-52 border-t border-[#9a927c] pt-2">
							<p className="font-serif text-lg italic text-[#8a8474]">
								Authorised signature
							</p>
							<p className="text-xs tracking-[0.14em] text-[#8a8474] uppercase">
								Academy Director
							</p>
						</div>
						<p className="mt-4 text-[11px] leading-relaxed text-[#8a8474]">
							{CONTACT.addressDisplay}
							<br />
							{CONTACT.phoneDisplay} · unicornbarberacademy.com
						</p>
					</div>

					<div className="flex shrink-0 flex-col items-center">
						<img
							src={qrDataUrl}
							alt={`QR code verifying certificate ${certificate.code}`}
							className="h-24 w-24"
						/>
						<p className="mt-1 max-w-40 text-center font-mono text-[10px] leading-tight break-all text-[#5b5648]">
							{verifyUrl.replace(/^https?:\/\//, "")}
						</p>
					</div>
				</footer>

				<p className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-widest text-[#9a927c] uppercase">
					{certificate.code}
				</p>
			</article>
		</main>
	);
}
