// src/features/enrollment-admin/applications-list-page.tsx
// Admissions table: status tabs, search, CSV export of the visible rows.
// Data flows through useApplicationsList (service layer) — filter changes
// fetch under their own query keys; mutations invalidate precisely.
import { IconDownload, IconPencil } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadApplicationsCsv } from "@/lib/api/enrollment-admin";
import type { ApplicationStatus } from "@/lib/enrollment";
import { APPLICATION_STATUS_LABELS, formatStartsOn } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import { useApplicationsList } from "@/service/enrollment";

const TABS: Array<{ label: string; status?: ApplicationStatus }> = [
	{ label: "All", status: undefined },
	{ label: "Pending", status: "pending" },
	{ label: "In review", status: "reviewing" },
	{ label: "Approved", status: "approved" },
	{ label: "Completed", status: "completed" },
	{ label: "Waitlisted", status: "waitlisted" },
	{ label: "Rejected", status: "rejected" },
];

export function ApplicationsListPage({
	statusFilter,
	search,
	page = 1,
}: {
	statusFilter?: ApplicationStatus;
	search?: string;
	page?: number;
}) {
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState(search ?? "");
	const filters = { status: statusFilter, search, page };
	const { data, isPending } = useApplicationsList(filters);

	function navigateWith(next: {
		status?: ApplicationStatus;
		search?: string;
		page?: number;
	}) {
		void navigate({
			to: "/dashboard/enrollments",
			search: {
				...(next.status ? { status: next.status } : {}),
				...(next.search ? { search: next.search } : {}),
				...(next.page && next.page > 1 ? { page: next.page } : {}),
			},
		});
	}

	const totalPages = data?.totalPages ?? 1;

	return (
		<div className="space-y-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Admissions
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Applications
					</h1>
					<p className="text-sm text-muted-foreground">
						{data ? `${data.total} total` : "Loading…"}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5"
						disabled={!data}
						onClick={() =>
							data &&
							downloadApplicationsCsv(
								data.items.map((a) => ({
									Reference: a.reference,
									Status: APPLICATION_STATUS_LABELS[a.status],
									Name: a.fullName,
									Email: a.email,
									Phone: a.phone,
									Program: a.programTitle,
									Cohort: a.cohort,
									Starts: a.startsOn,
									Fee: a.feeStatus,
									Submitted: a.submittedAt.slice(0, 10),
								})),
							)
						}
					>
						{/* Exports only this page's rows — labeled honestly so
						    admins don't assume a full-dataset dump. */}
						<IconDownload className="h-3.5 w-3.5" /> Export page (CSV)
					</Button>
					<Link
						to="/dashboard/enrollments/intakes"
						className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
					>
						Intakes
					</Link>
				</div>
			</header>

			<div className="flex flex-wrap items-center gap-2">
				{TABS.map((tab) => (
					<button
						key={tab.label}
						type="button"
						onClick={() => navigateWith({ status: tab.status })}
						className={cn(
							buttonVariants({ variant: "outline", size: "sm" }),
							statusFilter === tab.status && "border-primary text-primary",
						)}
					>
						{tab.label}
					</button>
				))}
				<span className="flex-1" />
				<form
					onSubmit={(e) => {
						e.preventDefault();
						navigateWith({ search: searchInput.trim() || undefined });
					}}
					className="flex gap-2"
				>
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search name, email, phone, ref…"
						className="h-8 w-56 text-xs"
					/>
					<Button type="submit" size="sm" variant="outline">
						Search
					</Button>
				</form>
			</div>

			{isPending ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<p className="text-sm text-muted-foreground">Loading applications…</p>
				</section>
			) : (data?.items.length ?? 0) === 0 ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<p className="text-sm text-muted-foreground">
						No applications found.
					</p>
				</section>
			) : (
				<ul className="divide-y divide-border rounded-xl border border-border bg-card">
					{(data?.items ?? []).map((application) => (
						<li
							key={application.id}
							className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
						>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										className="h-5 px-1.5 font-mono text-[10px]"
										variant="secondary"
									>
										{application.reference}
									</Badge>
									<Badge
										variant={
											application.status === "approved"
												? "default"
												: "secondary"
										}
										className="h-5 px-1.5 text-[10px]"
									>
										{APPLICATION_STATUS_LABELS[application.status]}
									</Badge>
									{application.feeStatus === "paid" ? (
										<Badge
											variant="outline"
											className="h-5 px-1.5 text-[10px] text-emerald-600"
										>
											Paid
										</Badge>
									) : null}
								</div>
								<p className="mt-1 truncate font-medium">
									{application.fullName}
								</p>
								<p className="truncate text-xs text-muted-foreground">
									{application.programTitle} ·{" "}
									{application.cohort === "day" ? "Day" : "Evening"} · starts{" "}
									{formatStartsOn(application.startsOn)} · {application.email}
								</p>
							</div>
							<Link
								to="/dashboard/enrollments/$id"
								params={{ id: String(application.id) }}
								aria-label="Review application"
								className={cn(
									buttonVariants({ variant: "ghost", size: "icon" }),
									"text-muted-foreground",
								)}
							>
								<IconPencil className="h-4 w-4" />
							</Link>
						</li>
					))}
				</ul>
			)}

			{(totalPages ?? 1) > 1 ? (
				<footer className="flex items-center justify-between text-sm">
					{page > 1 ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigateWith({
									status: statusFilter,
									search,
									page: page - 1,
								})
							}
						>
							Previous
						</Button>
					) : (
						<span className="text-muted-foreground">Previous</span>
					)}
					<span className="text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					{data && page < totalPages ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								navigateWith({
									status: statusFilter,
									search,
									page: page + 1,
								})
							}
						>
							Next
						</Button>
					) : (
						<span className="text-muted-foreground">Next</span>
					)}
				</footer>
			) : null}
		</div>
	);
}
