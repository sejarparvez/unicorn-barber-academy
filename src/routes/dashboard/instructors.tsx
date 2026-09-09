// routes/dashboard/instructors.tsx
// Instructor roster management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { InstructorsPage } from "@/features/admin/instructors-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/instructors")({
	beforeLoad: async ({ location }) => ({
		session: await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		}),
	}),
	head: () => ({
		meta: [
			{ title: "Instructors | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: InstructorsPage,
});
