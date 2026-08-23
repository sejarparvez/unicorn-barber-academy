// routes/dashboard/enrollments/intakes.tsx
// Intake manager. Admin-only. Reads via useIntakesAdmin (service layer).
import { createFileRoute } from "@tanstack/react-router";
import { IntakesPage } from "@/features/enrollment-admin/intakes-page";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/enrollments/intakes")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	head: () => ({
		meta: [
			{ title: "Program intakes | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: IntakesRoute,
});

function IntakesRoute() {
	return <IntakesPage />;
}
