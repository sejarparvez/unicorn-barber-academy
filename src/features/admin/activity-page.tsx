// src/features/admin/activity-page.tsx
// Append-only admin activity trail: who did what, to which record, when.
// Read-only by design — rows are never edited or deleted from the UI.
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAuditLog } from "@/service/audit";

const ACTION_GROUPS = [
	"user.role",
	"user.ban",
	"user.unban",
	"program.update",
	"settings.update",
	"intake.create",
	"intake.update",
	"intake.delete",
	"application.status",
	"application.bulk-status",
	"application.fee",
	"certificate.issue",
	"certificate.revoke",
	"instructor.create",
	"instructor.update",
	"instructor.delete",
	"gallery.create",
	"gallery.update",
	"gallery.delete",
	"testimonial.create",
	"testimonial.update",
	"testimonial.delete",
];

export function ActivityPage() {
	const [action, setAction] = useState("");
	const [page, setPage] = useState(1);
	const { data, isPending } = useAuditLog({
		...(action ? { action } : {}),
		page,
	});

	return (
		<div className="space-y-6">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Administration
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Activity
				</h1>
				<p className="text-sm text-muted-foreground">
					Every privileged change, with actor and timestamp. Append-only.
				</p>
			</header>

			<div className="flex flex-wrap gap-3">
				<select
					value={action}
					onChange={(e) => {
						setAction(e.target.value);
						setPage(1);
					}}
					className="h-9 rounded-md border border-border bg-background px-3 text-sm"
					aria-label="Filter by action"
				>
					<option value="">All actions</option>
					{ACTION_GROUPS.map((a) => (
						<option key={a} value={a}>
							{a}
						</option>
					))}
				</select>
			</div>

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>When</TableHead>
							<TableHead>Actor</TableHead>
							<TableHead>Action</TableHead>
							<TableHead>What happened</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isPending ? (
							<TableRow>
								<TableCell colSpan={4}>
									<Skeleton className="h-4 w-full" />
								</TableCell>
							</TableRow>
						) : (data?.items.length ?? 0) === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="p-8 text-center text-sm text-muted-foreground"
								>
									No activity yet — privileged actions appear here as they
									happen.
								</TableCell>
							</TableRow>
						) : (
							(data?.items ?? []).map((entry) => (
								<TableRow key={entry.id}>
									<TableCell className="text-xs whitespace-nowrap text-muted-foreground">
										{new Date(entry.createdAt).toLocaleString("en-GB", {
											day: "numeric",
											month: "short",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</TableCell>
									<TableCell className="max-w-48 truncate text-sm">
										{entry.actorName || entry.actorEmail || `#${entry.actorId}`}
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="font-mono text-[10px]"
										>
											{entry.action}
										</Badge>
									</TableCell>
									<TableCell className="min-w-64 text-sm">
										{entry.summary}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{data && data.totalPages > 1 ? (
				<div className="flex items-center gap-3 text-sm">
					<Button
						variant="outline"
						size="sm"
						disabled={page <= 1}
						onClick={() => setPage((p) => p - 1)}
					>
						Previous
					</Button>
					<span className="text-muted-foreground">
						Page {data.page} of {data.totalPages} ({data.total} events)
					</span>
					<Button
						variant="outline"
						size="sm"
						disabled={page >= data.totalPages}
						onClick={() => setPage((p) => p + 1)}
					>
						Next
					</Button>
				</div>
			) : null}
		</div>
	);
}
