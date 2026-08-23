import { IconArrowRight } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { isStaff, parseRole, ROLE_LABELS, type Role } from "@/lib/roles";
import { cn, getInitials } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardIndex,
	head: () => ({
		meta: [
			{ title: "Dashboard | Unicorn Barber Training Academy" },
			{ name: "robots", content: "noindex" },
		],
	}),
});

function DashboardIndex() {
	const { session } = Route.useRouteContext();
	const role = parseRole(session.user.role);
	const firstName = session.user.name?.split(" ")[0] || "";

	return (
		<div className="space-y-8">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Dashboard
					</p>
					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
						Welcome back{firstName ? `, ${firstName}` : ""}
					</h1>
					<p className="mt-2 text-muted-foreground">
						Your training journey at Unicorn Barber Training Academy, in one
						place.
					</p>
				</div>
				<Avatar className="h-16 w-16 border-2 border-primary/20">
					<AvatarImage
						src={session.user.image ?? undefined}
						alt={session.user.name || "User avatar"}
					/>
					<AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
						{getInitials(session.user.name)}
					</AvatarFallback>
				</Avatar>
			</header>

			<AccountCard role={role} />

			{/* Role-aware body: each account sees exactly what applies to them. */}
			{role === undefined || role === "user" ? <NotEnrolledCard /> : null}
			{role === "student" ? <StudentSections /> : null}
			{isStaff(role) && role !== undefined ? (
				<StaffSection role={role} />
			) : null}
		</div>
	);
}

function AccountCard({ role }: { role?: Role }) {
	const { session } = Route.useRouteContext();

	return (
		<section className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
			<h2 className="font-heading text-xl font-semibold">Account</h2>
			<dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
				<div>
					<dt className="text-muted-foreground">Name</dt>
					<dd className="mt-1 font-medium">{session.user.name || "—"}</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Email</dt>
					<dd className="mt-1 flex items-center gap-2 font-medium">
						{session.user.email}
						{session.user.emailVerified ? (
							<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
								Verified
							</Badge>
						) : (
							<Badge
								variant="outline"
								className="h-5 px-1.5 text-[10px] text-amber-600"
							>
								Unverified
							</Badge>
						)}
					</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Role</dt>
					<dd className="mt-1 font-medium">
						{role ? ROLE_LABELS[role] : (session.user.role ?? "—")}
					</dd>
				</div>
			</dl>
		</section>
	);
}

/** Registered account with no enrollment yet — nudge toward programs. */
function NotEnrolledCard() {
	return (
		<section className="rounded-xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
			<h2 className="font-heading text-xl font-semibold">
				You&rsquo;re registered — not enrolled yet
			</h2>
			<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
				Your account is ready whenever you are. Browse the programs, pick a
				track, and hold your seat — enrollment takes a couple of minutes and
				your details are already saved.
			</p>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Link
					to="/programs"
					className={cn(buttonVariants({ size: "lg" }), "gap-2")}
				>
					Browse programs
					<IconArrowRight className="h-4 w-4" stroke={1.75} />
				</Link>
				<Link
					to="/enroll"
					className={buttonVariants({ variant: "outline", size: "lg" })}
				>
					Start enrollment
				</Link>
			</div>
		</section>
	);
}

/** Enrolled trainee: application/cohort tracking (data model coming soon). */
function StudentSections() {
	return (
		<section className="grid gap-4 sm:grid-cols-2">
			<div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
				<h3 className="font-medium">Enrollments</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Application tracking and cohort details are coming soon.
				</p>
			</div>
			<div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
				<h3 className="font-medium">Bookings &amp; Reviews</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					Manage practical sessions and leave instructor reviews here.
				</p>
			</div>
		</section>
	);
}

/** Instructor / admin surface — staff tooling lands with the admin area. */
function StaffSection({ role }: { role: Role }) {
	return (
		<section className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
			<h3 className="font-medium">Staff tools</h3>
			<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
				Class rosters, student progress, and enrollment approvals for{" "}
				{ROLE_LABELS[role]} accounts are coming soon.
			</p>
		</section>
	);
}
