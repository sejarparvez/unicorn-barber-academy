import {
	IconArticle,
	IconCertificate,
	IconClipboardList,
	IconClockHour4,
	IconGauge,
	IconHome,
	IconLayoutDashboard,
	IconLogout,
	IconMail,
	IconPhoto,
	IconQuestionMark,
	IconSettings,
	IconStar,
	IconUser,
} from "@tabler/icons-react";
import {
	createFileRoute,
	Link,
	Outlet,
	useMatches,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { parseRole } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
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

type NavGroup = {
	label: string;
	items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
	{
		label: "Overview",
		items: [
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
		],
	},
	{
		label: "Admissions",
		items: [
			{
				label: "Applications",
				to: "/dashboard/enrollments",
				icon: IconClipboardList,
				visibleFor: "admin",
			},
			{
				label: "Intakes",
				to: "/dashboard/enrollments/intakes",
				icon: IconClockHour4,
				visibleFor: "admin",
			},
		],
	},
	{
		label: "Content",
		items: [
			{
				label: "Blog",
				to: "/dashboard/blog",
				icon: IconArticle,
				visibleFor: "admin",
			},
			{
				label: "Instructors",
				to: "/dashboard/instructors",
				icon: IconUser,
				visibleFor: "admin",
			},
			{
				label: "Gallery",
				to: "/dashboard/gallery",
				icon: IconPhoto,
				visibleFor: "admin",
			},
			{
				label: "Testimonials",
				to: "/dashboard/testimonials",
				icon: IconStar,
				visibleFor: "admin",
			},
			{
				label: "FAQs",
				to: "/dashboard/faqs",
				icon: IconQuestionMark,
				visibleFor: "admin",
			},
		],
	},
	{
		label: "System",
		items: [
			{
				label: "Users",
				to: "/dashboard/users",
				icon: IconUser,
				visibleFor: "admin",
			},
			{
				label: "Inbox",
				to: "/dashboard/inbox",
				icon: IconMail,
				visibleFor: "admin",
			},
			{
				label: "Site",
				to: "/dashboard/site",
				icon: IconSettings,
				visibleFor: "admin",
			},
			{
				label: "Console",
				to: "/dashboard/admin",
				icon: IconGauge,
				visibleFor: "admin",
			},
			{
				label: "Settings",
				to: "/dashboard/settings",
				icon: IconSettings,
				visibleFor: "all",
			},
		],
	},
];

function visibleNav(role: string | undefined): NavGroup[] {
	const keep = (item: NavItem) => {
		if (role === "admin") return true;
		if (role === "instructor" || role === "student") {
			return role === "instructor"
				? item.visibleFor !== "admin"
				: item.visibleFor === "all";
		}
		return item.visibleFor === "all";
	};
	return NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter(keep),
	})).filter((group) => group.items.length > 0);
}

function isActive(pathname: string, to: string): boolean {
	return to === "/dashboard"
		? pathname === "/dashboard"
		: pathname === to || pathname.startsWith(`${to}/`);
}

/** Human label for the current section, used by the mobile trigger + breadcrumb. */
function sectionLabel(pathname: string, groups: NavGroup[]): string {
	let best: NavItem | null = null;
	for (const group of groups) {
		for (const item of group.items) {
			if (
				item.to !== "/dashboard" &&
				isActive(pathname, item.to) &&
				(!best || item.to.length > best.to.length)
			) {
				best = item;
			}
		}
	}
	if (best) {
		// Detail views: "/dashboard/enrollments/12" -> "Applications / #12".
		const rest = pathname.slice(best.to.length).replace(/^\//, "");
		return rest ? `${best.label} / ${rest}` : best.label;
	}
	return "Overview";
}

const CmdK = lazy(() =>
	import("@/components/cmd-k").then((m) => ({ default: m.CmdK })),
);

function DashboardLayout() {
	const { session } = Route.useRouteContext() as {
		session?: SessionPayload;
	};
	// beforeLoad redirects anonymous visitors to sign-in, but the layout
	// can render a beat without context during that transition — bail out
	// instead of crashing on `session.user`.
	if (!session) return null;
	const role = parseRole(session.user.role) ?? undefined;
	const groups = visibleNav(role);
	return (
		<SidebarProvider>
			<DashboardSidebar groups={groups} session={session} />
			<SidebarInset>
				<Suspense>
					<CmdK />
				</Suspense>
				<DashboardHeader groups={groups} />
				<div className="min-w-0 flex-1 bg-muted/25 px-4 py-8 sm:px-6 lg:px-8">
					<div className="mx-auto max-w-7xl">
						<Outlet />
					</div>
				</div>
				<footer className="border-t border-border bg-background px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
					© {new Date().getFullYear()} Unicorn Barber Training Academy ·{" "}
					<Link to="/" className="underline-offset-4 hover:underline">
						View site
					</Link>
				</footer>
			</SidebarInset>
		</SidebarProvider>
	);
}

function userInitials(name: string): string {
	const parts = name.trim().split(/\s+/);
	return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

function DashboardSidebar({
	groups,
	session,
}: {
	groups: NavGroup[];
	session: SessionPayload;
}) {
	const matches = useMatches();
	const pathname = matches.at(-1)?.pathname ?? "/dashboard";
	const role = parseRole(session.user.role);
	const { setOpenMobile } = useSidebar();
	// The mobile sidebar is a Sheet — route changes don't dismiss it
	// automatically, so close it explicitly on every nav tap.
	const closeMobileNav = () => setOpenMobile(false);
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
							<span className="flex size-8 items-center justify-center rounded-md bg-primary font-heading text-sm font-semibold text-primary-foreground">
								U
							</span>
							<span className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">Unicorn</span>
								<span className="truncate text-xs text-muted-foreground">
									Academy admin
								</span>
							</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{groups.map((group) => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.to}>
										<SidebarMenuButton
											render={<Link to={item.to} onClick={closeMobileNav} />}
											isActive={isActive(pathname, item.to)}
											tooltip={item.label}
										>
											<item.icon stroke={1.75} />
											<span>{item.label}</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<UserMenu session={session} role={role} />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}

/** Account menu behind the sidebar avatar: dashboard home, settings,
 *  back-to-site, and sign out. */
function UserMenu({
	session,
	role,
}: {
	session: SessionPayload;
	role: string | undefined;
}) {
	const navigate = useNavigate();
	const router = useRouter();
	const { setOpenMobile } = useSidebar();

	async function handleSignOut() {
		setOpenMobile(false);
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					void navigate({ to: "/" });
					void router.invalidate();
				},
			},
		});
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				// Plain button on purpose: nesting SidebarMenuButton here breaks
				// Base UI's trigger ref/prop merging (it wraps itself in a
				// Tooltip when `tooltip` is set) and crashed on open.
				render={
					<button
						type="button"
						aria-label={`Account menu for ${session.user.name}`}
						title={`${session.user.name} · ${role ?? "staff"}`}
						className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&_svg]:size-4 [&_svg]:shrink-0"
					/>
				}
			>
				<Avatar className="size-8 rounded-md">
					{session.user.image ? (
						<AvatarImage src={session.user.image} alt={session.user.name} />
					) : null}
					<AvatarFallback className="rounded-md">
						{userInitials(session.user.name)}
					</AvatarFallback>
				</Avatar>
				<span className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-semibold">{session.user.name}</span>
					<span className="truncate text-xs text-muted-foreground">
						{session.user.email}
					</span>
				</span>
				{role ? (
					<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
						{role}
					</Badge>
				) : null}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" side="top" className="w-56">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-normal">
						<span className="block truncate text-sm font-medium">
							{session.user.name}
						</span>
						<span className="block truncate text-xs text-muted-foreground">
							{session.user.email}
						</span>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={() => {
						setOpenMobile(false);
						void navigate({ to: "/dashboard" });
					}}
				>
					<IconLayoutDashboard className="h-4 w-4" />
					Dashboard
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setOpenMobile(false);
						void navigate({ to: "/dashboard/settings" });
					}}
				>
					<IconSettings className="h-4 w-4" />
					Account settings
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => {
						setOpenMobile(false);
						void navigate({ to: "/" });
					}}
				>
					<IconHome className="h-4 w-4" />
					View site
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
					<IconLogout className="h-4 w-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function DashboardHeader({ groups }: { groups: NavGroup[] }) {
	const matches = useMatches();
	const pathname = matches.at(-1)?.pathname ?? "/dashboard";
	const label = sectionLabel(pathname, groups);
	return (
		<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 transition-[width,height] ease-linear">
			<SidebarTrigger className="-ml-1 shrink-0" />
			<Separator orientation="vertical" className="mr-2 h-4 shrink-0" />
			<Breadcrumb className="min-w-0 flex-1">
				<BreadcrumbList className="flex-nowrap">
					<BreadcrumbItem className="shrink-0">
						<BreadcrumbLink
							render={<Link to="/" aria-label="Back to home page" />}
						>
							<IconHome className="h-4 w-4" stroke={1.75} />
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="shrink-0" />
					<BreadcrumbItem className="hidden shrink-0 md:block">
						<BreadcrumbLink render={<Link to="/dashboard" />}>
							Dashboard
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden shrink-0 md:block" />
					<BreadcrumbItem className="min-w-0">
						<BreadcrumbPage className="truncate">{label}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</header>
	);
}
