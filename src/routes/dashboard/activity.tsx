// routes/dashboard/activity.tsx
// Admin activity trail viewer. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/features/admin/activity-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/activity")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Activity | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: ActivityPage,
});
