// routes/dashboard/admin.tsx
// Admin console: at-a-glance admissions pipeline, charts, upcoming intake fill
// rates, content stats, and the newest applications. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import {
	AdminConsoleError,
	AdminConsolePage,
	AdminConsoleSkeleton,
} from "@/features/admin/console-page";
import { getConsoleOverviewFn } from "@/server/console-fns";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/admin")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	loader: () => getConsoleOverviewFn(),
	head: () => ({
		meta: [
			{ title: "Admin Console | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	pendingComponent: AdminConsoleSkeleton,
	errorComponent: AdminConsoleError,
	component: AdminConsoleView,
});

function AdminConsoleView() {
	const overview = Route.useLoaderData();
	return <AdminConsolePage overview={overview} />;
}
