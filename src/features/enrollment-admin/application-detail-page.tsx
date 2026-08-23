// src/features/enrollment-admin/application-detail-page.tsx
// Admissions decision surface: applicant info, status transitions with an
// optional decision note, offline fee toggle. Approving upgrades the
// applicant's role to student (server-side) and emails them.
//
// Data comes from useApplicationDetail (service layer), primed with the
// route loader's snapshot; status/fee mutations invalidate precisely.
import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationDetail } from "@/lib/enrollment";
import { APPLICATION_STATUS_LABELS, formatStartsOn } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import {
	useApplicationDetail,
	useSetApplicationFee,
	useSetApplicationStatus,
} from "@/service/enrollment";

const STATUS_FLOW: Array<{
	status: "reviewing" | "approved" | "waitlisted" | "rejected";
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

	const setFee = useSetApplicationFee(application.id);
	const setStatus = useSetApplicationStatus(application.id);
	const busy = setFee.isPending || setStatus.isPending;
	const [note, setNote] = useState(application.decisionNote ?? "");
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

	async function toggleFee() {
		setError(null);
		try {
			await setFee.mutateAsync(application.feeStatus !== "paid");
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
				</section>

				{/* Actions */}
				<aside className="space-y-5">
					<section className="space-y-3 rounded-xl border border-border bg-card p-5">
						<h2 className="font-heading text-sm font-semibold">
							Decision note (optional)
						</h2>
						<Textarea
							rows={3}
							value={note}
							onChange={(e) => setNote(e.target.value)}
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
						<Button
							variant={application.feeStatus === "paid" ? "outline" : "default"}
							disabled={busy}
							onClick={toggleFee}
							className="w-full"
						>
							{application.feeStatus === "paid"
								? "Mark as unpaid"
								: "Mark as paid"}
						</Button>
					</section>
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
