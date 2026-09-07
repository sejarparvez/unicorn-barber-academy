// routes/dashboard/enrollments.index.tsx
// Admissions table. Admin-only.
import { createFileRoute } from "@tanstack/react-router";
import { ApplicationsListPage } from "@/features/enrollment-admin/applications-list-page";
import {
	parseApplicationStatus,
	parseCohort,
	parseFeeStatus,
} from "@/lib/enrollment";
import { requireRoles } from "@/server/guards";

type EnrollmentsSearch = {
	status?: ReturnType<typeof parseApplicationStatus>;
	search?: string;
	programSlug?: string;
	cohort?: ReturnType<typeof parseCohort>;
	feeStatus?: ReturnType<typeof parseFeeStatus>;
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
		const programSlug =
			typeof search.programSlug === "string" && search.programSlug.trim()
				? search.programSlug.trim().slice(0, 50)
				: undefined;
		const cohort = parseCohort(search.cohort);
		const feeStatus = parseFeeStatus(search.feeStatus);
		return {
			...(status ? { status } : {}),
			...(searchQ ? { search: searchQ } : {}),
			...(programSlug ? { programSlug } : {}),
			...(cohort ? { cohort } : {}),
			...(feeStatus ? { feeStatus } : {}),
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
	const { status, search, programSlug, cohort, feeStatus, page } =
		Route.useSearch();
	return (
		<ApplicationsListPage
			statusFilter={status}
			search={search}
			programSlug={programSlug}
			cohort={cohort}
			feeStatus={feeStatus}
			page={page ?? 1}
		/>
	);
}
