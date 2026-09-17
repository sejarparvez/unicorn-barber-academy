// routes/dashboard/inbox.tsx
// Contact-inquiry triage. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { InboxPage } from "@/features/admin/inbox-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/inbox")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Inbox | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: InboxPage,
});
