import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRoles } from "@/server/guards";

// Auth gate for everything under /dashboard: resolves the session on the
// server (works during SSR and client navigation) and bounces anonymous
// visitors to sign-in, preserving their destination in ?redirect=.
// Role-restricted sub-routes pass `allowed: [...]` to requireRoles().
export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ location }) => {
		const session = await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
		return { session };
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	return (
		<main className="section-light min-h-[calc(100svh-4rem)] bg-background px-6 py-12">
			<div className="mx-auto max-w-5xl">
				<Outlet />
			</div>
		</main>
	);
}
