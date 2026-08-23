// routes/dashboard/enrollments/$id.tsx
// Admissions decision page. Admin-only.
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ApplicationDetailPage } from "@/features/enrollment-admin/application-detail-page";
import { getApplicationAdminFn } from "@/server/enrollment-fns";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/enrollments/$id")({
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	loader: async ({ params }) => {
		const id = Number.parseInt(params.id, 10);
		if (!Number.isInteger(id) || id < 1) throw notFound();
		const result = await getApplicationAdminFn({ data: { id } });
		if (!result) throw notFound();
		return result;
	},
	head: () => ({
		meta: [
			{ title: "Review application | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: ApplicationRoute,
});

function ApplicationRoute() {
	const { application } = Route.useLoaderData();
	return <ApplicationDetailPage initialApplication={application} />;
}
