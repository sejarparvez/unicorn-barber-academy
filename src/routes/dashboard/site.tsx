// routes/dashboard/site.tsx
// Academy-global site settings. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { SitePage } from "@/features/admin/site-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/site")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Site Settings | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: SitePage,
});
