// routes/verify.$code.tsx
// Public certificate verification — the URL encoded in every printed QR
// code. Employers confirm a graduate's credential here; revoked codes
// resolve to an explicit "revoked" state instead of vanishing.
import {
	IconCertificate,
	IconCircleCheck,
	IconCircleX,
	IconSearch,
} from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CONTACT } from "@/data/site";
import type { VerifyResult } from "@/lib/certificates";
import { COHORT_LABELS } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { verifyCertificateFn } from "@/server/certificate-fns";

export const Route = createFileRoute("/verify/$code")({
	loader: async ({ params }) => {
		const result = await verifyCertificateFn({
			data: { code: decodeURIComponent(params.code) },
		});
		return { result };
	},
	head: () => ({
		meta: [
			{
				title: "Verify a Certificate | Unicorn Barber Training Academy",
			},
			{
				name: "description",
				content:
					"Confirm the authenticity of a Unicorn Barber Training Academy certificate by its verification code.",
			},
			{ property: "og:type", content: "website" },
			// Infinite URL space (/verify/<anything>) — keep crawlers from
			// indexing arbitrary codes; meta (not robots.txt) so they still see
			// the noindex directive.
			{ name: "robots", content: "noindex" },
		],
	}),
	component: VerifyPage,
});

function formatLongDate(value: string) {
	return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function VerifyPage() {
	const code = Route.useParams().code;
	const { result } = Route.useLoaderData();

	return (
		<main className="mx-auto max-w-2xl px-6 py-24">
			<header className="text-center">
				<p className="text-[11px] font-medium tracking-[0.22em] text-primary uppercase">
					Certificate verification
				</p>
				<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
					Check a graduate&rsquo;s credential
				</h1>
				<p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
					Every certificate we issue carries a unique code. Enter it below or
					scan the QR code on the document.
				</p>
				<CodeForm initialCode={code} />
			</header>

			<section aria-live="polite" className="mt-12">
				<ResultCard result={result} />
			</section>
		</main>
	);
}

function CodeForm({ initialCode }: { initialCode: string }) {
	const navigate = useNavigate();
	const [value, setValue] = useState(initialCode);

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				const normalized = value.trim().toUpperCase();
				if (!normalized) return;
				void navigate({
					to: "/verify/$code",
					params: { code: encodeURIComponent(normalized) },
				});
			}}
			className="mx-auto mt-8 flex max-w-sm items-center gap-2"
		>
			<label htmlFor="verify-code" className="sr-only">
				Certificate code
			</label>
			<input
				id="verify-code"
				value={value}
				onChange={(event) => setValue(event.target.value)}
				placeholder="UBT-2025-0001"
				autoCapitalize="characters"
				className="h-10 w-full rounded-md border border-border bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground/60"
			/>
			<button
				type="submit"
				className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
			>
				<IconSearch className="h-4 w-4" stroke={1.75} />
				Verify
			</button>
		</form>
	);
}

function ResultCard({ result }: { result: VerifyResult }) {
	if (result.kind === "unknown") {
		return (
			<div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
				<IconSearch
					className="mx-auto h-10 w-10 text-muted-foreground/50"
					stroke={1.5}
				/>
				<h2 className="mt-4 font-heading text-xl font-semibold">
					No certificate found
				</h2>
				<p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
					Double-check the code printed on the document (format{" "}
					<span className="font-mono">UBT-YYYY-NNNN</span>). If it still
					doesn&rsquo;t resolve, contact us at {CONTACT.phoneDisplay}.
				</p>
			</div>
		);
	}

	const valid = result.kind === "valid";
	return (
		<article
			className={cn(
				"overflow-hidden rounded-xl border bg-card shadow-sm",
				valid ? "border-primary/40" : "border-destructive/50",
			)}
		>
			<div
				className={cn(
					"flex items-center gap-3 px-6 py-4",
					valid ? "bg-primary/5" : "bg-destructive/10",
				)}
			>
				{valid ? (
					<IconCircleCheck
						className="h-7 w-7 shrink-0 text-primary"
						stroke={1.75}
					/>
				) : (
					<IconCircleX
						className="h-7 w-7 shrink-0 text-destructive"
						stroke={1.75}
					/>
				)}
				<div>
					<h2 className="font-heading text-lg font-semibold">
						{valid ? "Valid certificate" : "Revoked certificate"}
					</h2>
					<p className="text-xs text-muted-foreground">
						{valid
							? "This credential was issued by the academy and is currently active."
							: "This certificate is no longer valid. Contact the academy for details."}
					</p>
				</div>
			</div>

			<dl className="grid gap-x-6 gap-y-4 px-6 py-6 text-sm sm:grid-cols-[auto_1fr]">
				<dt className="text-muted-foreground">Issued to</dt>
				<dd className="font-semibold">{result.holderName}</dd>

				<dt className="text-muted-foreground">Program</dt>
				<dd className="font-semibold">
					{result.programTitle ?? result.programSlug}
				</dd>

				<dt className="text-muted-foreground">Cohort</dt>
				<dd className="font-semibold">
					{COHORT_LABELS[result.cohort as keyof typeof COHORT_LABELS] ??
						result.cohort}
				</dd>

				<dt className="text-muted-foreground">Issued on</dt>
				<dd className="font-semibold">{formatLongDate(result.issuedOn)}</dd>

				<dt className="text-muted-foreground">Code</dt>
				<dd className="font-mono font-semibold tracking-wider">
					{result.code}
				</dd>
			</dl>

			{valid ? (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
					<Badge variant="secondary" className="gap-1.5">
						<IconCertificate className="h-3.5 w-3.5" stroke={1.75} />
						Issued by Unicorn Barber Training Academy
					</Badge>
					<a
						href={`/programs/${result.programSlug}`}
						className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
					>
						View program details
					</a>
				</div>
			) : null}
		</article>
	);
}
