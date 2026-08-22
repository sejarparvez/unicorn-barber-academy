import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";

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

	return (
		<div className="space-y-8">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Dashboard
					</p>
					<h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
						Welcome back, {session.user.name?.split(" ")[0] || "student"}
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
						<dd className="mt-1 font-medium capitalize">{session.user.role}</dd>
					</div>
				</dl>
			</section>

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
		</div>
	);
}
