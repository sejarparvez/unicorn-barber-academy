// src/features/enrollment-admin/applications-list-page.tsx
// Admissions table: status tabs, search, advanced filters, CSV export.
// Data flows through useApplicationsList (service layer) — filter changes
// fetch under their own query keys; mutations invalidate precisely.
import {
	IconChevronDown,
	IconChevronUp,
	IconDownload,
	IconPencil,
} from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ALL_PROGRAMS } from "@/data/programs";
import { downloadApplicationsCsv } from "@/lib/api/enrollment-admin";
import type { ApplicationStatus, Cohort, FeeStatus } from "@/lib/enrollment";
import {
	APPLICATION_STATUS_LABELS,
	COHORT_LABELS,
	COHORTS,
	FEE_STATUSES,
	formatStartsOn,
	parseCohort,
	parseFeeStatus,
} from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import {
	useApplicationsList,
	useBulkSetApplicationStatus,
} from "@/service/enrollment";
import { BulkActionBar } from "./bulk-action-bar";
import { ListPagination } from "./list-pagination";

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
	programSlug,
	cohort,
	feeStatus,
	page = 1,
}: {
	statusFilter?: ApplicationStatus;
	search?: string;
	programSlug?: string;
	cohort?: Cohort;
	feeStatus?: FeeStatus;
	page?: number;
}) {
	const navigate = useNavigate();
	const [searchInput, setSearchInput] = useState(search ?? "");
	const [showAdvanced, setShowAdvanced] = useState(
		!!programSlug || !!cohort || !!feeStatus,
	);
	const filters = {
		status: statusFilter,
		search,
		programSlug,
		cohort,
		feeStatus,
		page,
	};
	const { data, isPending } = useApplicationsList(filters);
	const bulkMutation = useBulkSetApplicationStatus();
	const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
	const [bulkStatus, setBulkStatus] = useState<ApplicationStatus>("pending");
	const [confirmBulk, setConfirmBulk] = useState(false);

	const allVisibleIds = useMemo(
		() => data?.items.map((a) => a.id) ?? [],
		[data],
	);
	const allSelected =
		allVisibleIds.length > 0 &&
		allVisibleIds.every((id) => selectedIds.has(id));

	const toggleAll = useCallback(() => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(allVisibleIds));
		}
	}, [allSelected, allVisibleIds]);

	const toggleOne = useCallback((id: number) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}, []);

	function handleBulkApply() {
		bulkMutation.mutate(
			{ ids: Array.from(selectedIds), status: bulkStatus },
			{
				onSuccess: () => {
					setSelectedIds(new Set());
					setConfirmBulk(false);
				},
			},
		);
	}

	function navigateWith(next: {
		status?: ApplicationStatus;
		search?: string;
		programSlug?: string;
		cohort?: Cohort;
		feeStatus?: FeeStatus;
		page?: number;
	}) {
		void navigate({
			to: "/dashboard/enrollments",
			search: {
				...(next.status ? { status: next.status } : {}),
				...(next.search ? { search: next.search } : {}),
				...(next.programSlug ? { programSlug: next.programSlug } : {}),
				...(next.cohort ? { cohort: next.cohort } : {}),
				...(next.feeStatus ? { feeStatus: next.feeStatus } : {}),
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
					<div className="text-sm text-muted-foreground">
						{data ? (
							`${data.total} total`
						) : (
							<Skeleton className="h-4 w-16 inline-block" />
						)}
					</div>
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
						navigateWith({
							search: searchInput.trim() || undefined,
							page: undefined,
						});
					}}
					className="flex gap-2"
				>
					<Input
						value={searchInput}
						onChange={(e) => setSearchInput(e.target.value)}
						placeholder="Search name, email, phone, ref…"
						aria-label="Search applications"
						className="h-8 w-56 text-xs"
					/>
					<Button type="submit" size="sm" variant="outline">
						Search
					</Button>
				</form>
			</div>

			<div>
				<button
					type="button"
					onClick={() => setShowAdvanced(!showAdvanced)}
					aria-expanded={showAdvanced}
					className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
				>
					Advanced filters
					{showAdvanced ? (
						<IconChevronUp className="h-3 w-3" />
					) : (
						<IconChevronDown className="h-3 w-3" />
					)}
				</button>
				{showAdvanced ? (
					<div className="mt-2 flex flex-wrap items-end gap-3">
						<div className="space-y-1">
							<span className="text-xs font-medium text-muted-foreground">
								Program
							</span>
							<Select
								value={programSlug ?? ""}
								onValueChange={(v) =>
									navigateWith({
										status: statusFilter,
										search,
										programSlug: v == null || v === "all" ? undefined : v,
										cohort,
										feeStatus,
										page: undefined,
									})
								}
							>
								<SelectTrigger
									className="h-8 w-36 text-xs"
									aria-label="Program"
								>
									<SelectValue placeholder="Any" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All programs</SelectItem>
									{ALL_PROGRAMS.map((p) => (
										<SelectItem key={p.slug} value={p.slug}>
											{p.title}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<span className="text-xs font-medium text-muted-foreground">
								Cohort
							</span>
							<Select
								value={cohort ?? ""}
								onValueChange={(v) =>
									navigateWith({
										status: statusFilter,
										search,
										programSlug,
										cohort:
											v == null || v === "all"
												? undefined
												: (parseCohort(v) ?? undefined),
										feeStatus,
										page: undefined,
									})
								}
							>
								<SelectTrigger className="h-8 w-40 text-xs" aria-label="Cohort">
									<SelectValue placeholder="Any" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any</SelectItem>
									{COHORTS.map((c) => (
										<SelectItem key={c} value={c}>
											{COHORT_LABELS[c]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<span className="text-xs font-medium text-muted-foreground">
								Fee status
							</span>
							<Select
								value={feeStatus ?? ""}
								onValueChange={(v) =>
									navigateWith({
										status: statusFilter,
										search,
										programSlug,
										cohort,
										feeStatus:
											v == null || v === "all"
												? undefined
												: (parseFeeStatus(v) ?? undefined),
										page: undefined,
									})
								}
							>
								<SelectTrigger
									className="h-8 w-36 text-xs"
									aria-label="Fee status"
								>
									<SelectValue placeholder="Any" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Any</SelectItem>
									{FEE_STATUSES.map((f) => (
										<SelectItem key={f} value={f}>
											{f === "paid" ? "Paid" : "Unpaid"}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						{programSlug || cohort || feeStatus ? (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() =>
									navigateWith({
										status: statusFilter,
										search,
										programSlug: undefined,
										cohort: undefined,
										feeStatus: undefined,
										page: undefined,
									})
								}
							>
								Clear filters
							</Button>
						) : null}
					</div>
				) : null}
			</div>

			{isPending ? (
				<ul className="divide-y divide-border rounded-xl border border-border bg-card">
					{Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
						<li key={i} className="flex items-center gap-4 p-4">
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-56" />
							</div>
							<Skeleton className="h-5 w-20 rounded-full" />
							<Skeleton className="h-8 w-20 rounded" />
						</li>
					))}
				</ul>
			) : (data?.items.length ?? 0) === 0 ? (
				<section className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
					<p className="text-sm text-muted-foreground">
						No applications found.
					</p>
				</section>
			) : (
				<>
					<BulkActionBar
						selectedCount={selectedIds.size}
						bulkStatus={bulkStatus}
						onBulkStatusChange={setBulkStatus}
						isPending={bulkMutation.isPending}
						confirmOpen={confirmBulk}
						onConfirmOpenChange={setConfirmBulk}
						onApply={handleBulkApply}
						onClear={() => setSelectedIds(new Set())}
					/>

					<ul className="divide-y divide-border rounded-xl border border-border bg-card">
						<li className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
							<input
								type="checkbox"
								checked={allSelected}
								onChange={toggleAll}
								className="h-4 w-4 accent-primary"
								aria-label="Select all"
							/>
							<span className="w-24">Ref</span>
							<span className="w-20">Status</span>
							<span className="flex-1">Name / Program</span>
							<span className="w-20 text-right">Action</span>
						</li>
						{(data?.items ?? []).map((application) => (
							<li
								key={application.id}
								className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
							>
								<input
									type="checkbox"
									checked={selectedIds.has(application.id)}
									onChange={() => toggleOne(application.id)}
									className="h-4 w-4 accent-primary"
									aria-label={`Select ${application.reference}`}
								/>
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
				</>
			)}

			<ListPagination
				page={page}
				totalPages={totalPages}
				total={data?.total ?? 0}
				onPrevious={() =>
					navigateWith({
						status: statusFilter,
						search,
						programSlug,
						cohort,
						feeStatus,
						page: page - 1,
					})
				}
				onNext={() =>
					navigateWith({
						status: statusFilter,
						search,
						programSlug,
						cohort,
						feeStatus,
						page: page + 1,
					})
				}
			/>
		</div>
	);
}
