// routes/dashboard/enrollments.index.tsx
// Admissions table. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/features/enrollment-admin/applications-list-page";
import { parseApplicationStatus } from "@/lib/enrollment";
import { requireRoles } from "@/server/guards";

type EnrollmentsSearch = {
	status?: ReturnType<typeof parseApplicationStatus>;
	search?: string;
	page?: number;
};

export const Route = createFileRoute("/dashboard/enrollments/")({
	validateSearch: (search: Record<string, unknown>): EnrollmentsSearch => {
		const status = parseApplicationStatus(search.status);
		const page = Number.parseInt(String(search.page ?? ""), 10);
		const searchQ =
			typeof search.search === "string" && search.search.trim()
				? search.search.trim().slice(0, 120)
				: undefined;
		return {
			...(status ? { status } : {}),
			...(searchQ ? { search: searchQ } : {}),
			...(Number.isInteger(page) && page > 1 ? { page } : {}),
		};
	},
	beforeLoad: async ({ location }) => {
		await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
			allowed: ["admin"],
		});
	},
	// Reads flow through useApplicationsList (src/service/enrollment.ts) so
	// mutations invalidate precisely — no loader to double-fetch.
	head: () => ({
		meta: [
			{ title: "Applications | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: ApplicationsRoute,
});

function ApplicationsRoute() {
	const { status, search, page } = Route.useSearch();
	return (
		<ApplicationsListPage
			statusFilter={status}
			search={search}
			page={page ?? 1}
		/>
	);
}
