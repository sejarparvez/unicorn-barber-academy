// routes/dashboard/site.tsx
// Academy-global site settings. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/features/admin/site-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/site")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Site Settings | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: SitePage,
});
