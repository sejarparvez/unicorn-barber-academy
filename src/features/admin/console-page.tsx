// src/features/admin/console-page.tsx
// Admin console overview (/dashboard/admin). Route keeps the loader; this page
// renders the loaded ConsoleOverview with KPI cards, charts, intake seat
// tracking, and the newest applications. Admin-only.
import {
	IconArrowRight,
	IconArticle,
	IconCertificate,
	IconClipboardList,
	IconUsersGroup,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ElementType } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { ConsoleOverview } from "@/lib/console";
import {
	APPLICATION_STATUS_LABELS,
	COHORT_LABELS,
	formatStartsOn,
	type IntakeAdmin,
} from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import {
	ApplicationsTimelineChart,
	FeesChart,
	PipelineChart,
	ProgramsChart,
} from "./console-charts";

export function AdminConsolePage({ overview }: { overview: ConsoleOverview }) {
	const pending =
		overview.admissions.byStatus.pending +
		overview.admissions.byStatus.reviewing;

	return (
		<div className="space-y-8">
			<header className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Console
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Academy overview
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Admissions pipeline, fee revenue, and published content at a glance.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Link
						to="/dashboard/enrollments"
						className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
					>
						All applications
					</Link>
					<Link
						to="/dashboard/enrollments/intakes"
						className={cn(buttonVariants({ size: "sm" }))}
					>
						Manage intakes
					</Link>
				</div>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={IconClipboardList}
					label="Needs review"
					value={String(pending)}
					hint={`${overview.admissions.total} applications total`}
					trend={overview.deltas.needsReview}
					to="/dashboard/enrollments"
					search={{ status: "pending" }}
				/>
				<StatCard
					icon={IconUsersGroup}
					label="Approved students"
					value={String(overview.admissions.byStatus.approved)}
					hint={`${overview.admissions.byStatus.completed} completed`}
					trend={overview.deltas.approved}
					to="/dashboard/enrollments"
					search={{ status: "approved" }}
				/>
				<StatCard
					icon={IconCertificate}
					label="Active certificates"
					value={String(overview.activeCertificates)}
					hint="Revoked certificates excluded"
					to="/dashboard/certificates"
				/>
				<StatCard
					icon={IconArticle}
					label="Published posts"
					value={String(overview.blog.published)}
					hint={`${overview.blog.draft} drafts waiting`}
					to="/dashboard/blog"
				/>
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				<ApplicationsTimelineChart data={overview.timeline} />
				<PipelineChart admissions={overview.admissions} />
			</section>

			<section className="grid gap-4 lg:grid-cols-2">
				<ProgramsChart data={overview.byProgram} />
				<FeesChart data={overview.feeRevenueByMonth} />
			</section>

			<IntakeFill intakes={overview.admissions.upcomingOpenIntakes} />

			<RecentApplications overview={overview} />
		</div>
	);
}

function StatCard({
	icon: Icon,
	label,
	value,
	hint,
	to,
	search,
	trend,
}: {
	icon: ElementType;
	label: string;
	value: string;
	hint: string;
	to: string;
	search?: Record<string, unknown>;
	trend?: number;
}) {
	return (
		<Link
			to={to}
			{...(search ? { search } : {})}
			className="group rounded-xl bg-card p-6 shadow-xs ring-1 ring-foreground/10 transition-colors hover:ring-primary/40"
		>
			<div className="flex items-start justify-between gap-2">
				<span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon className="h-4.5 w-4.5" stroke={1.75} />
				</span>
				{trend !== undefined ? <TrendChip count={trend} /> : null}
			</div>
			<p className="mt-4 text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
				{label}
			</p>
			<p className="mt-1 font-heading text-3xl font-semibold tabular-nums">
				{value}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
		</Link>
	);
}

function TrendChip({ count }: { count: number }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
				count > 0
					? "bg-primary/10 text-primary"
					: "bg-muted text-muted-foreground",
			)}
		>
			{count > 0 ? `+${count}` : count} in 7d
		</span>
	);
}

function IntakeFill({ intakes }: { intakes: IntakeAdmin[] }) {
	if (intakes.length === 0) {
		return (
			<section className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
				No open upcoming intakes — create one from the{" "}
				<Link
					to="/dashboard/enrollments/intakes"
					className="text-primary underline underline-offset-2"
				>
					intake manager
				</Link>
				.
			</section>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Upcoming intake seats</CardTitle>
				<CardDescription>
					{intakes.length} open intake{intakes.length === 1 ? "" : "s"} starting
					soon — watch the fill rate before seats run out.
				</CardDescription>
				<CardAction>
					<Link
						to="/dashboard/enrollments/intakes"
						className="text-xs font-medium text-primary hover:underline"
					>
						Manage intakes
					</Link>
				</CardAction>
			</CardHeader>
			<CardContent>
				<ul className="space-y-4">
					{intakes.map((intake) => {
						const taken = Math.max(0, intake.seatsTotal - intake.seatsLeft);
						const pct = Math.round((taken / intake.seatsTotal) * 100);
						return (
							<li key={intake.id}>
								<div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-sm">
									<p className="font-medium">
										{intake.programTitle}{" "}
										<span className="font-normal text-muted-foreground">
											· {COHORT_LABELS[intake.cohort] ?? intake.cohort} · starts{" "}
											{formatStartsOn(intake.startsOn)}
										</span>
									</p>
									<p className="tabular-nums text-muted-foreground">
										{taken}/{intake.seatsTotal} seats · {pct}%
									</p>
								</div>
								<Progress value={pct} className="mt-2 h-2" />
							</li>
						);
					})}
				</ul>
			</CardContent>
		</Card>
	);
}

function RecentApplications({ overview }: { overview: ConsoleOverview }) {
	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="font-heading text-lg font-semibold">
					Latest applications
				</h2>
				<Link
					to="/dashboard/enrollments"
					className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
				>
					View all
					<IconArrowRight className="h-3.5 w-3.5" />
				</Link>
			</div>
			{overview.recentApplications.length === 0 ? (
				<p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
					No applications yet — share the enroll page to get the pipeline
					moving.
				</p>
			) : (
				<div className="overflow-hidden rounded-xl bg-card shadow-xs ring-1 ring-foreground/10">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Reference</TableHead>
								<TableHead>Applicant</TableHead>
								<TableHead>Program</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{overview.recentApplications.map((app) => (
								<TableRow key={app.id}>
									<TableCell>
										<Link
											to="/dashboard/enrollments/$id"
											params={{ id: String(app.id) }}
											className="font-mono text-xs font-semibold text-primary hover:underline"
										>
											{app.reference}
										</Link>
									</TableCell>
									<TableCell className="max-w-48 truncate font-medium">
										{app.fullName}
									</TableCell>
									<TableCell className="max-w-52 truncate text-muted-foreground">
										{app.programTitle}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												app.status === "approved" || app.status === "completed"
													? "default"
													: app.status === "rejected" ||
															app.status === "waitlisted"
														? "outline"
														: "secondary"
											}
											className={cn(
												"h-5 px-1.5 text-[10px]",
												(app.status === "pending" ||
													app.status === "reviewing") &&
													"text-amber-600",
											)}
										>
											{APPLICATION_STATUS_LABELS[app.status]}
										</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</section>
	);
}

export function AdminConsoleSkeleton() {
	return (
		<div className="space-y-8">
			<header>
				<Skeleton className="h-3 w-20" />
				<Skeleton className="mt-1 h-7 w-40" />
				<Skeleton className="mt-1 h-3 w-64" />
			</header>
			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{["needs-review", "approved", "certificates", "posts"].map((k) => (
					<div
						key={k}
						className="rounded-xl bg-card p-6 ring-1 ring-foreground/10"
					>
						<Skeleton className="h-9 w-9" />
						<Skeleton className="mt-4 h-3 w-24" />
						<Skeleton className="mt-1 h-8 w-12" />
						<Skeleton className="mt-1 h-3 w-32" />
					</div>
				))}
			</section>
			<section className="grid gap-4 lg:grid-cols-2">
				<Skeleton className="h-72 rounded-xl" />
				<Skeleton className="h-72 rounded-xl" />
			</section>
			<Skeleton className="h-64 rounded-xl" />
		</div>
	);
}

export function AdminConsoleError() {
	return (
		<div className="space-y-4">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Console
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Academy overview
				</h1>
			</header>
			<div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
				<p className="text-sm text-muted-foreground">
					Failed to load the admin overview. Please try refreshing the page.
				</p>
			</div>
		</div>
	);
}
