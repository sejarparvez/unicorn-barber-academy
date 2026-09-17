// routes/dashboard/enrollments/intakes.tsx
// Intake manager. Admin-only. Reads via useIntakesAdmin (service layer).
import { createFileRoute } from "@tanstack/react-router";
import { IntakesPage } from "@/features/enrollment-admin/intakes-page";
import { requireRoleFromContext } from "@/server/guards";

export const Route = createFileRoute("/dashboard/enrollments/intakes")({
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
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
