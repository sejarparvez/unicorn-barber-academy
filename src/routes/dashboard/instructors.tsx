// routes/dashboard/instructors.tsx
// Instructor roster management. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { InstructorsPage } from "@/features/admin/instructors-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/instructors")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Instructors | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: InstructorsPage,
});
