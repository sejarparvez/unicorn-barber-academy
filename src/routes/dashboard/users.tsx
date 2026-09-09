// routes/dashboard/users.tsx
// Admin user management: accounts, roles, bans. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/admin/users-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/users")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Users | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: UsersPage,
});
