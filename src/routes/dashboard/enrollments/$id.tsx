// routes/dashboard/enrollments/$id.tsx
// Admissions decision page. Admin-only.
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
	errorComponent: ApplicationError,
	component: ApplicationRoute,
});

function ApplicationError() {
	return (
		<div className="space-y-4 p-6">
			<h1 className="font-heading text-xl font-semibold">
				Application unavailable
			</h1>
			<p className="text-sm text-muted-foreground">
				This application could not be loaded. It may have been removed or there
				was a temporary server error.
			</p>
			<Link
				to="/dashboard/enrollments"
				className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
			>
				Back to applications
			</Link>
		</div>
	);
}

function ApplicationRoute() {
	const { application } = Route.useLoaderData();
	return <ApplicationDetailPage initialApplication={application} />;
}
