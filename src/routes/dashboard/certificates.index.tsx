// routes/dashboard/certificates.index.tsx
// The student's certificate wallet: every issued certificate with print and
// public-verification sharing. Certificates themselves are minted by admins
// from completed applications — this page is read-only.
import {
	IconBrandFacebook,
	IconBrandWhatsapp,
	IconBrandX,
	IconCopy,
	IconExternalLink,
	IconPrinter,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import type { CertificateRecord } from "@/lib/certificates";
import { COHORT_LABELS } from "@/lib/enrollment";
import { APP_ORIGIN } from "@/lib/env";
import { cn } from "@/lib/utils";
import { listMyCertificatesFn } from "@/server/certificate-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/certificates/")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
	},
	loader: () => listMyCertificatesFn(),
	head: () => ({
		meta: [
			{ title: "My Certificates | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: CertificatesPage,
});

function verifyUrl(code: string) {
	return `${APP_ORIGIN}/verify/${code}`;
}

function formatIssuedOn(value: string) {
	return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function CertificatesPage() {
	const certificates = Route.useLoaderData();

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Achievements
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					My certificates
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Download a printable copy or share the verification link — employers
					can confirm authenticity with the QR code.
				</p>
			</header>

			{certificates.length === 0 ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<h2 className="font-heading text-lg font-semibold">
						No certificates yet
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
						When you complete a program, the academy issues your certificate and
						it appears here automatically.
					</p>
				</section>
			) : (
				<ul className="grid gap-4 md:grid-cols-2">
					{certificates.map((certificate) => (
						<CertificateCard key={certificate.id} certificate={certificate} />
					))}
				</ul>
			)}
		</div>
	);
}

function CertificateCard({ certificate }: { certificate: CertificateRecord }) {
	const url = verifyUrl(certificate.code);
	const revoked = Boolean(certificate.revokedAt);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			toast.success("Verification link copied");
		} catch {
			toast.error("Could not copy the link");
		}
	}

	return (
		<li className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
						{certificate.code}
					</p>
					<h2 className="mt-1 truncate font-heading text-lg font-semibold">
						{certificate.programTitle ?? certificate.programSlug}
					</h2>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{COHORT_LABELS[certificate.cohort]} · issued{" "}
						{formatIssuedOn(certificate.issuedOn)}
					</p>
				</div>
				<Badge
					variant={revoked ? "destructive" : "default"}
					className="h-5 shrink-0 px-1.5 text-[10px]"
				>
					{revoked ? "Revoked" : "Valid"}
				</Badge>
			</div>

			<p className="mt-3 truncate text-xs text-muted-foreground">
				Verify at{" "}
				<span className="text-foreground/70">
					{url.replace(/^https?:\/\//, "")}
				</span>
			</p>

			<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
				<Link
					to="/certificates/$id/print"
					params={{ id: String(certificate.id) }}
					className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
				>
					<IconPrinter className="h-4 w-4" stroke={1.75} />
					Print / PDF
				</Link>
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5"
					onClick={copyLink}
				>
					<IconCopy className="h-4 w-4" stroke={1.75} />
					Copy link
				</Button>
				<a
					href={`https://wa.me/?text=${encodeURIComponent(`I completed ${certificate.programTitle ?? "my training"} at Unicorn Barber Training Academy — verify: ${url}`)}`}
					target="_blank"
					rel="noreferrer"
					aria-label="Share on WhatsApp"
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
						"h-8 w-8",
					)}
				>
					<IconBrandWhatsapp className="h-4 w-4" stroke={1.75} />
				</a>
				<a
					href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
					target="_blank"
					rel="noreferrer"
					aria-label="Share on Facebook"
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
						"h-8 w-8",
					)}
				>
					<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
				</a>
				<a
					href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent("I earned my barbering certificate!")}`}
					target="_blank"
					rel="noreferrer"
					aria-label="Share on X"
					className={cn(
						buttonVariants({ variant: "outline", size: "icon" }),
						"h-8 w-8",
					)}
				>
					<IconBrandX className="h-4 w-4" stroke={1.75} />
				</a>
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					aria-label="Open verification page"
					className={cn(
						buttonVariants({ variant: "ghost", size: "icon" }),
						"ml-auto h-8 w-8 text-muted-foreground",
					)}
				>
					<IconExternalLink className="h-4 w-4" stroke={1.75} />
				</a>
			</div>
		</li>
	);
}
