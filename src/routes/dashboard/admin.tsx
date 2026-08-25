// routes/dashboard/admin.tsx
// Admin console: at-a-glance admissions pipeline, upcoming intake fill
// rates, content stats, and the newest applications. Admin-only.
import {
	IconArrowRight,
	IconArticle,
	IconCertificate,
	IconClipboardList,
	IconUsersGroup,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { IntakeAdmin } from "@/lib/enrollment";
import { APPLICATION_STATUS_LABELS, formatStartsOn } from "@/lib/enrollment";
import { cn } from "@/lib/utils";
import type { ConsoleOverview } from "@/server/console-fns";
import { getConsoleOverviewFn } from "@/server/console-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/admin")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	loader: () => getConsoleOverviewFn(),
	head: () => ({
		meta: [
			{ title: "Admin Console | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: AdminConsolePage,
});

function AdminConsolePage() {
	const overview = Route.useLoaderData();
	const pending =
		overview.admissions.byStatus.pending +
		overview.admissions.byStatus.reviewing;

	return (
		<div className="space-y-8">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Console
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Academy overview
				</h1>
			</header>

			<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<StatCard
					icon={IconClipboardList}
					label="Needs review"
					value={String(pending)}
					hint={`${overview.admissions.total} applications total`}
					to="/dashboard/enrollments"
					search={{ status: "pending" }}
				/>
				<StatCard
					icon={IconUsersGroup}
					label="Approved students"
					value={String(overview.admissions.byStatus.approved)}
					hint={`${overview.admissions.byStatus.completed} completed`}
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
}: {
	icon: React.ElementType;
	label: string;
	value: string;
	hint: string;
	to: string;
	search?: Record<string, unknown>;
}) {
	return (
		<Link
			to={to}
			{...(search ? { search } : {})}
			className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
		>
			<div className="flex items-center justify-between">
				<p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
					{label}
				</p>
				<Icon
					className="h-5 w-5 text-muted-foreground/60 transition-colors group-hover:text-primary"
					stroke={1.75}
				/>
			</div>
			<p className="mt-3 font-heading text-3xl font-semibold tabular-nums">
				{value}
			</p>
			<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
		</Link>
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
		<section className="space-y-3 rounded-xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-center justify-between">
				<h2 className="font-heading text-lg font-semibold">
					Upcoming intake seats
				</h2>
				<Link
					to="/dashboard/enrollments/intakes"
					className="text-xs font-medium text-primary hover:underline"
				>
					Manage intakes
				</Link>
			</div>
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
										· {COHORT_SHORT[intake.cohort] ?? intake.cohort} · starts{" "}
										{formatStartsOn(intake.startsOn)}
									</span>
								</p>
								<p className="tabular-nums text-muted-foreground">
									{taken}/{intake.seatsTotal} seats · {pct}%
								</p>
							</div>
							<Progress value={pct} className="mt-1.5 h-2" />
						</li>
					);
				})}
			</ul>
		</section>
	);
}

const COHORT_SHORT: Record<string, string> = {
	day: "Day",
	evening: "Evening",
};

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
				<div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
