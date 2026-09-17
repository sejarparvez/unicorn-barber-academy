// routes/dashboard/activity.tsx
// Admin activity trail viewer. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { ActivityPage } from "@/features/admin/activity-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/activity")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Activity | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: ActivityPage,
});
