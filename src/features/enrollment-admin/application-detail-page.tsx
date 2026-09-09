// src/features/enrollment-admin/application-detail-page.tsx
// Admissions decision surface: applicant info, status transitions with an
// optional decision note, offline fee toggle, and certificate issuance for
// graduates. Approving upgrades the applicant's role to student (server-side).
//
// Data comes from useApplicationDetail (service layer), primed with the
// route loader's snapshot; status/fee/certificate mutations invalidate
// precisely.
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationDetail, ApplicationStatus } from "@/lib/enrollment";
import {
	APPLICATION_STATUS_LABELS,
	FEE_METHOD_LABELS,
	formatFeePoisha,
	formatStartsOn,
	parseApplicationStatus,
} from "@/lib/enrollment";
import { APP_ORIGIN } from "@/lib/env";
import { cn } from "@/lib/utils";
import {
	useApplicationCertificate,
	useIssueCertificate,
	useSetCertificateRevocation,
} from "@/service/certificate";
import {
	useApplicationDetail,
	useApplicationStatusLog,
	useRecordFeePayment,
	useSetApplicationStatus,
	useVoidFeePayment,
} from "@/service/enrollment";

const STATUS_FLOW: Array<{
	status: ApplicationStatus;
	label: string;
	tone: string;
}> = [
	{ status: "reviewing", label: "Mark in review", tone: "" },
	{
		status: "approved",
		label: "Approve",
		tone: "bg-emerald-600 hover:bg-emerald-600/90",
	},
	{ status: "waitlisted", label: "Waitlist", tone: "" },
	{
		status: "rejected",
		label: "Reject",
		tone: "bg-destructive hover:bg-destructive/90",
	},
	{
		status: "completed",
		label: "Mark completed (graduated)",
		tone: "bg-primary hover:bg-primary/90",
	},
];

export function ApplicationDetailPage({
	initialApplication,
}: {
	initialApplication: ApplicationDetail;
}) {
	const { data } = useApplicationDetail(initialApplication.id, {
		initialData: { application: initialApplication },
	});
	const application = data?.application ?? initialApplication;

	const setStatus = useSetApplicationStatus(application.id);
	const recordPayment = useRecordFeePayment(application.id);
	const voidPayment = useVoidFeePayment(application.id);
	const busy =
		recordPayment.isPending || voidPayment.isPending || setStatus.isPending;
	const [amountTaka, setAmountTaka] = useState("");
	const [payMethod, setPayMethod] = useState("cash");
	const [receipt, setReceipt] = useState("");
	const [note, setNote] = useState(application.decisionNote ?? "");
	// If another admin saves a note while this page is open, the refetched
	// value replaces our (untouched) local copy — but only when the local
	// editor hasn't been typed into yet.
	const [noteDirty, setNoteDirty] = useState(false);
	useEffect(() => {
		if (!noteDirty) setNote(application.decisionNote ?? "");
	}, [application.decisionNote, noteDirty]);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	async function transition(status: (typeof STATUS_FLOW)[number]["status"]) {
		setError(null);
		setNotice(null);
		try {
			const result = await setStatus.mutateAsync({
				status,
				note: note.trim() || null,
			});
			setNotice(
				result.userRoleUpgraded
					? `Status updated to "${APPLICATION_STATUS_LABELS[status]}". Applicant's account was upgraded to Student and notified by email.`
					: `Status updated to "${APPLICATION_STATUS_LABELS[status]}".`,
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	}

	async function recordFee(event: React.FormEvent) {
		event.preventDefault();
		const taka = Number.parseInt(amountTaka, 10);
		if (!Number.isInteger(taka) || taka < 1) {
			setError("Enter a valid amount in taka");
			return;
		}
		setError(null);
		setNotice(null);
		try {
			await recordPayment.mutateAsync({
				amountTaka: taka,
				method: payMethod,
				receipt: receipt.trim() || null,
			});
			setAmountTaka("");
			setReceipt("");
			setNotice("Payment recorded.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	}

	async function voidFee(paymentId: number) {
		setError(null);
		setNotice(null);
		try {
			await voidPayment.mutateAsync(paymentId);
			setNotice("Payment voided.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	}

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Link
						to="/dashboard/enrollments"
						aria-label="Back to applications"
						className={cn(
							buttonVariants({ variant: "ghost", size: "icon" }),
							"text-muted-foreground",
						)}
					>
						<IconArrowLeft className="h-4 w-4" />
					</Link>
					<div>
						<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
							Application{" "}
							<span className="font-mono">{application.reference}</span>
						</p>
						<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
							{application.fullName}
						</h1>
					</div>
					<Badge
						variant={
							application.status === "approved" ? "default" : "secondary"
						}
					>
						{APPLICATION_STATUS_LABELS[application.status]}
					</Badge>
					{application.feeStatus === "paid" ? (
						<Badge variant="outline" className="text-emerald-600">
							Fee paid
						</Badge>
					) : (
						<Badge variant="outline">Fee unpaid</Badge>
					)}
				</div>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}
			{notice ? (
				<p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
					{notice}
				</p>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				{/* Applicant + program info */}
				<section className="space-y-4 rounded-xl border border-border bg-card p-6">
					<h2 className="font-heading text-lg font-semibold">Applicant</h2>
					<dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
						<Row label="Email" value={application.email} />
						<Row label="Phone" value={application.phone} />
						<Row
							label="Account"
							value={`#${application.userId} · ${application.userRole ?? "user"}`}
						/>
						<Row
							label="Submitted"
							value={new Date(application.submittedAt).toLocaleString()}
						/>
						{application.hearAbout ? (
							<Row label="Heard via" value={application.hearAbout} />
						) : null}
					</dl>

					<h2 className="pt-2 font-heading text-lg font-semibold">Program</h2>
					<dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
						<Row label="Program" value={application.programTitle} />
						<Row
							label="Cohort"
							value={
								application.cohort === "day" ? "Day cohort" : "Evening cohort"
							}
						/>
						<Row label="Starts" value={formatStartsOn(application.startsOn)} />
						<Row
							label="Intake seats"
							value={`${application.seatsOccupied}/${application.seatsTotal} held${application.intakeOpen ? "" : " · closed"}`}
						/>
					</dl>

					{application.experienceNote ? (
						<>
							<h2 className="pt-2 font-heading text-lg font-semibold">
								Notes from applicant
							</h2>
							<p className="rounded-md border border-border bg-muted/30 p-3 text-sm leading-relaxed">
								{application.experienceNote}
							</p>
						</>
					) : null}

					{application.decisionNote || application.decidedAt ? (
						<>
							<h2 className="pt-2 font-heading text-lg font-semibold">
								Decision record
							</h2>
							<p className="text-sm text-muted-foreground">
								Decided{" "}
								{application.decidedAt
									? new Date(application.decidedAt).toLocaleString()
									: "—"}
								{application.decisionNote
									? ` — ${application.decisionNote}`
									: ""}
							</p>
						</>
					) : null}

					<StatusHistory applicationId={application.id} />
				</section>

				{/* Actions */}
				<aside className="space-y-5">
					<section className="space-y-3 rounded-xl border border-border bg-card p-5">
						<h2 className="font-heading text-sm font-semibold">
							Decision note (optional)
						</h2>
						<Textarea
							rows={3}
							aria-label="Decision note (optional)"
							value={note}
							onChange={(e) => {
								setNote(e.target.value);
								setNoteDirty(true);
							}}
							placeholder="Recorded with the decision; included in the admin trail only."
						/>
						<p className="text-[11px] text-muted-foreground">
							Terminal decisions email the applicant automatically.
						</p>
						<div className="grid grid-cols-1 gap-2">
							{STATUS_FLOW.filter((s) => s.status !== application.status).map(
								(step) => (
									<Button
										key={step.status}
										disabled={busy}
										onClick={() => transition(step.status)}
										className={step.tone}
									>
										{busy ? "Working…" : step.label}
									</Button>
								),
							)}
						</div>
					</section>

					<section className="space-y-3 rounded-xl border border-border bg-card p-5">
						<h2 className="font-heading text-sm font-semibold">
							Registration fee
						</h2>
						<Label>Offline tracking — bKash / cash / bank at the academy</Label>
						<p className="text-sm">
							<span className="font-semibold tabular-nums">
								{formatFeePoisha(application.feePaidPoisha)}
							</span>{" "}
							<span className="text-muted-foreground">
								of {formatFeePoisha(application.programFeePoisha)} paid
							</span>
						</p>
						{application.payments.length > 0 ? (
							<ul className="divide-y divide-border rounded-md border border-border">
								{application.payments.map((payment) => (
									<li
										key={payment.id}
										className="flex items-center gap-2 px-3 py-2 text-xs"
									>
										<span className="font-semibold tabular-nums">
											{formatFeePoisha(payment.amountPoisha)}
										</span>
										<span className="text-muted-foreground">
											{FEE_METHOD_LABELS[payment.method]}
											{payment.receiptRef ? ` · ${payment.receiptRef}` : ""}
											{payment.receivedByName
												? ` · ${payment.receivedByName}`
												: ""}
											{" · "}
											{new Date(payment.paidAt).toLocaleDateString("en-GB", {
												day: "numeric",
												month: "short",
											})}
										</span>
										<button
											type="button"
											disabled={busy}
											onClick={() => void voidFee(payment.id)}
											className="ml-auto text-muted-foreground hover:text-destructive disabled:opacity-50"
										>
											Void
										</button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-xs text-muted-foreground">
								No payments recorded yet.
							</p>
						)}
						<form
							onSubmit={recordFee}
							className="grid grid-cols-[1fr_auto] gap-2"
						>
							<Input
								placeholder="Amount ৳"
								value={amountTaka}
								onChange={(e) => setAmountTaka(e.target.value)}
								inputMode="numeric"
								className="h-9"
								aria-label="Payment amount in taka"
							/>
							<select
								value={payMethod}
								onChange={(e) => setPayMethod(e.target.value)}
								className="h-9 rounded-md border border-border bg-background px-2 text-xs"
								aria-label="Payment method"
							>
								<option value="cash">Cash</option>
								<option value="bkash">bKash</option>
								<option value="bank">Bank</option>
							</select>
							<Input
								placeholder="Receipt ref (optional)"
								value={receipt}
								onChange={(e) => setReceipt(e.target.value)}
								className="h-9 col-span-2"
								aria-label="Receipt reference"
							/>
							<Button
								type="submit"
								disabled={busy}
								className="col-span-2 w-full"
							>
								Record payment
							</Button>
						</form>
					</section>

					<CertificatePanel applicationId={application.id} />
				</aside>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="mt-0.5 font-medium break-all">{value}</dd>
		</div>
	);
}

/** Issue / manage the certificate minted from this application. */
function CertificatePanel({ applicationId }: { applicationId: number }) {
	const { data: certificate } = useApplicationCertificate(applicationId);
	const issue = useIssueCertificate();
	const revoke = useSetCertificateRevocation();
	const [confirmRevoked, setConfirmRevoked] = useState(false);

	const canIssue = !certificate;

	async function onIssue() {
		try {
			const code = await issue.mutateAsync(applicationId);
			toast.success(`Certificate ${code} issued`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Issuance failed");
		}
	}

	async function onToggleRevocation() {
		if (!certificate) return;
		const next = !certificate.revokedAt;
		// Revocation breaks live QR links employers may already hold —
		// require a second click to confirm (restore stays one click).
		if (next && !confirmRevoked) {
			setConfirmRevoked(true);
			return;
		}
		setConfirmRevoked(false);
		try {
			await revoke.mutateAsync({
				id: certificate.id,
				revoked: next,
				reason: next ? "Revoked from application detail" : null,
			});
			toast.success(next ? "Certificate revoked" : "Certificate restored");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Update failed");
		}
	}

	return (
		<section className="space-y-3 rounded-xl border border-border bg-card p-5">
			<h2 className="font-heading text-sm font-semibold">Certificate</h2>

			{certificate ? (
				<div className="space-y-2 text-sm">
					<p className="flex items-center justify-between gap-2">
						<span className="text-muted-foreground">Code</span>
						<Badge
							variant={certificate.revokedAt ? "destructive" : "default"}
							className="h-5 px-1.5 text-[10px]"
						>
							{certificate.revokedAt ? "Revoked" : "Active"}
						</Badge>
					</p>
					<p className="font-mono text-sm font-semibold tracking-wider">
						{certificate.code}
					</p>
					<a
						href={`${APP_ORIGIN}/verify/${certificate.code}`}
						target="_blank"
						rel="noreferrer"
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							"w-full",
						)}
					>
						Open verification page
					</a>
					<Button
						variant="ghost"
						size="sm"
						className={cn("w-full", confirmRevoked && "text-destructive")}
						disabled={issue.isPending || revoke.isPending}
						onClick={onToggleRevocation}
					>
						{certificate.revokedAt
							? "Restore certificate"
							: confirmRevoked
								? "Click again to confirm revocation"
								: "Revoke…"}
					</Button>
				</div>
			) : (
				<div className="space-y-2">
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						Issuing requires the application to be <strong>completed</strong>{" "}
						and the registration fee <strong>paid</strong>. The graduate finds
						the certificate in their dashboard.
					</p>
					<Button
						variant="outline"
						size="sm"
						className="w-full"
						disabled={!canIssue || issue.isPending}
						onClick={onIssue}
					>
						{issue.isPending ? "Issuing…" : "Issue certificate"}
					</Button>
				</div>
			)}
		</section>
	);
}

function StatusHistory({ applicationId }: { applicationId: number }) {
	const { data: log, isPending } = useApplicationStatusLog(applicationId);

	if (isPending) {
		return (
			<>
				<h2 className="pt-2 font-heading text-lg font-semibold">History</h2>
				<output className="block space-y-3" aria-label="Loading history">
					{[0, 1, 2].map((i) => (
						<div key={i} className="space-y-1.5">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/3" />
						</div>
					))}
				</output>
			</>
		);
	}

	if (!log || log.length === 0) return null;

	return (
		<>
			<h2 className="pt-2 font-heading text-lg font-semibold">History</h2>
			<ol className="relative border-l border-border pl-4 text-sm">
				{log.map((entry) => (
					<li key={entry.id} className="relative mb-4 last:mb-0">
						<span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border border-border bg-muted" />
						<p className="font-medium">
							{APPLICATION_STATUS_LABELS[
								parseApplicationStatus(entry.fromStatus) ?? "pending"
							] ?? entry.fromStatus}
							{" → "}
							{APPLICATION_STATUS_LABELS[
								parseApplicationStatus(entry.toStatus) ?? "pending"
							] ?? entry.toStatus}
						</p>
						<p className="text-xs text-muted-foreground">
							{entry.adminName ?? "Admin"} ·{" "}
							{new Date(entry.createdAt).toLocaleString()}
						</p>
						{entry.note ? (
							<p className="mt-1 rounded border border-border bg-muted/30 p-2 text-xs">
								{entry.note}
							</p>
						) : null}
					</li>
				))}
			</ol>
		</>
	);
}
