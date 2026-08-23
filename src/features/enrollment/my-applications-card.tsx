// src/features/enrollment/my-applications-card.tsx
// Signed-in applicant's view of their own applications — replaces the old
// "Enrollments coming soon" dashboard placeholder.
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { MyApplication } from "@/lib/enrollment";
import { APPLICATION_STATUS_LABELS, formatStartsOn } from "@/lib/enrollment";
import { cn } from "@/lib/utils";

function formatDateSafe(iso: string): string {
	return new Date(iso).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const STATUS_BADGE: Record<MyApplication["status"], string> = {
	pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
	reviewing: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
	approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
	waitlisted: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
	rejected: "bg-muted text-muted-foreground",
};

export function MyApplicationsCard({
	applications,
}: {
	applications: MyApplication[];
}) {
	if (applications.length === 0) {
		return (
			<section className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
				<h2 className="font-heading text-xl font-semibold">
					Want to train with us?
				</h2>
				<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
					Browse the programs, pick an intake with open seats, and apply — your
					account details are already filled in.
				</p>
				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Link to="/enroll" className={cn(buttonVariants(), "gap-2")}>
						Start application
						<IconArrowRight className="h-4 w-4" stroke={1.75} />
					</Link>
					<Link
						to="/programs"
						className={buttonVariants({ variant: "outline" })}
					>
						Browse programs
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="font-heading text-xl font-semibold">
					Your applications
				</h2>
				<Link
					to="/enroll"
					className="text-sm font-medium text-primary hover:underline"
				>
					Apply for another cohort
				</Link>
			</div>
			<ul className="divide-y divide-border rounded-xl border border-border bg-card">
				{applications.map((application) => (
					<li
						key={application.id}
						className="flex flex-wrap items-center gap-3 p-4"
					>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<Badge
									className={cn(
										"h-5 px-1.5 text-[10px]",
										STATUS_BADGE[application.status],
									)}
								>
									{APPLICATION_STATUS_LABELS[application.status]}
								</Badge>
								{application.feeStatus === "paid" ? (
									<Badge variant="outline" className="h-5 px-1.5 text-[10px]">
										Fee paid
									</Badge>
								) : null}
							</div>
							<p className="mt-1 font-medium">{application.programTitle}</p>
							<p className="text-xs text-muted-foreground">
								{application.cohort === "day" ? "Day" : "Evening"} cohort ·
								starts {formatStartsOn(application.startsOn)} ·{" "}
								<span className="font-mono">{application.reference}</span> ·
								applied {formatDateSafe(application.submittedAt)}
							</p>
						</div>
						{application.status === "approved" &&
						application.feeStatus !== "paid" ? (
							<p className="text-xs text-muted-foreground sm:max-w-48">
								Visit the academy to pay your registration fee and pick up your
								kit.
							</p>
						) : null}
					</li>
				))}
			</ul>
		</section>
	);
}
