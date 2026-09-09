// routes/dashboard/inbox.tsx
// Contact-inquiry triage. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { InboxPage } from "@/features/admin/inbox-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/inbox")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Inbox | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: InboxPage,
});
