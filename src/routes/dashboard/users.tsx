// routes/dashboard/users.tsx
// Admin user management: accounts, roles, bans. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/features/admin/users-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/users")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Users | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: UsersPage,
});
