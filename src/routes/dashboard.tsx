import {
	IconArticle,
	IconCertificate,
	IconChevronRight,
	IconClipboardList,
	IconGauge,
	IconLayoutDashboard,
	IconMenu2,
	IconSettings,
} from "@tabler/icons-react";
import {
	createFileRoute,
	Link,
	Outlet,
	useMatches,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { parseRole } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ location }) => {
		const session = await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
		return { session };
	},
	errorComponent: DashboardError,
	component: DashboardLayout,
});

function DashboardError() {
	return (
		<main className="min-h-[calc(100svh-4rem)] bg-muted/25">
			<div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
				<h1 className="font-heading text-2xl font-semibold">
					Something went wrong
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					An error occurred in the dashboard. Please try refreshing the page.
				</p>
				<Link
					to="/dashboard"
					className="mt-6 inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
				>
					Back to overview
				</Link>
			</div>
		</main>
	);
}

type NavItem = {
	label: string;
	to: string;
	icon: typeof IconLayoutDashboard;
	visibleFor: "all" | "staff" | "admin";
};

const NAV_ITEMS: NavItem[] = [
	{
		label: "Overview",
		to: "/dashboard",
		icon: IconLayoutDashboard,
		visibleFor: "all",
	},
	{
		label: "Certificates",
		to: "/dashboard/certificates",
		icon: IconCertificate,
		visibleFor: "all",
	},
	{
		label: "Admissions",
		to: "/dashboard/enrollments",
		icon: IconClipboardList,
		visibleFor: "admin",
	},
	{
		label: "Console",
		to: "/dashboard/admin",
		icon: IconGauge,
		visibleFor: "admin",
	},
	{
		label: "Blog",
		to: "/dashboard/blog",
		icon: IconArticle,
		visibleFor: "admin",
	},
	{
		label: "Settings",
		to: "/dashboard/settings",
		icon: IconSettings,
		visibleFor: "all",
	},
];

function visibleNav(role: string | undefined): NavItem[] {
	if (role === "admin") return NAV_ITEMS;
	if (role === "instructor" || role === "student") {
		return NAV_ITEMS.filter((item) =>
			role === "instructor"
				? item.visibleFor !== "admin"
				: item.visibleFor === "all",
		);
	}
	return NAV_ITEMS.filter((item) => item.visibleFor === "all");
}

function isActive(pathname: string, to: string): boolean {
	return to === "/dashboard"
		? pathname === "/dashboard"
		: pathname === to || pathname.startsWith(`${to}/`);
}

function DashboardLayout() {
	const { session } = Route.useRouteContext();
	return (
		<main className="min-h-[calc(100svh-4rem)] bg-muted/25">
			<div className="mx-auto flex max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
				<Sidebar session={session} />
				<div className="min-w-0 flex-1">
					<MobileNav session={session} />
					<Outlet />
				</div>
			</div>
		</main>
	);
}

function useCurrentSection(session: SessionPayload) {
	const matches = useMatches();
	const role = parseRole(session.user.role);
	const items = visibleNav(role ?? undefined);
	const last = matches[matches.length - 1];
	const pathname = last?.pathname ?? "/dashboard";
	return (
		items.find(
			(item) => isActive(pathname, item.to) && item.to !== "/dashboard",
		) ?? items[0]
	);
}

function NavLinks({
	session,
	onNavigate,
}: {
	session: SessionPayload;
	onNavigate?: () => void;
}) {
	const matches = useMatches();
	const pathname = matches.at(-1)?.pathname ?? "/dashboard";
	const items = visibleNav(parseRole(session.user.role) ?? undefined);
	return (
		<nav className="space-y-1" aria-label="Dashboard sections">
			{items.map((item) => {
				const active = isActive(pathname, item.to);
				return (
					<Link
						key={item.to}
						to={item.to}
						onClick={onNavigate}
						aria-current={active ? "page" : undefined}
						className={cn(
							"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
							active
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<item.icon className="h-4 w-4 shrink-0" stroke={1.75} />
						{item.label}
						{active ? (
							<IconChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
						) : null}
					</Link>
				);
			})}
		</nav>
	);
}

function Sidebar({ session }: { session: SessionPayload }) {
	return (
		<aside className="sticky top-24 hidden h-fit w-52 shrink-0 self-start lg:block">
			<p className="px-3 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
				Dashboard
			</p>
			<Separator className="my-3" />
			<NavLinks session={session} />
		</aside>
	);
}

function MobileNav({ session }: { session: SessionPayload }) {
	const [open, setOpen] = useState(false);
	const section = useCurrentSection(session);
	return (
		<div className="mb-6 lg:hidden">
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger
					render={<Button variant="outline" size="sm" className="gap-2" />}
				>
					<IconMenu2 className="h-4 w-4" stroke={1.75} />
					{section?.label ?? "Dashboard"}
				</SheetTrigger>
				<SheetContent side="left" className="w-72 p-0">
					<SheetHeader className="border-b border-border px-5 py-4">
						<SheetTitle className="font-heading text-base font-semibold">
							Dashboard
						</SheetTitle>
					</SheetHeader>
					<div className="p-3">
						<NavLinks session={session} onNavigate={() => setOpen(false)} />
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
