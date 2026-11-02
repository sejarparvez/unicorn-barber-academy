// routes/dashboard/certificates.admin.tsx
// Admin certificate registry: search, filter, paginate and revoke issued
// credentials. Admin-only; the student wallet lives at /dashboard/certificates.
import { createFileRoute } from "@tanstack/react-router";
import { CertificateRegistryPage } from "@/features/admin/certificate-registry-page";
import type { CertificateListStatus } from "@/lib/certificates";
import { requireRoleFromContext } from "@/server/guards";

type RegistrySearch = {
	search?: string;
	status?: Exclude<CertificateListStatus, "all">;
	page?: number;
};

export const Route = createFileRoute("/dashboard/certificates/admin")({
	validateSearch: (search: Record<string, unknown>): RegistrySearch => {
		const searchQ =
			typeof search.search === "string" && search.search.trim()
				? search.search.trim().slice(0, 120)
				: undefined;
		const status =
			search.status === "active" || search.status === "revoked"
				? search.status
				: undefined;
		const page = Number.parseInt(String(search.page ?? ""), 10);
		return {
			...(searchQ ? { search: searchQ } : {}),
			...(status ? { status } : {}),
			...(Number.isInteger(page) && page > 1 ? { page } : {}),
		};
	},
	beforeLoad: ({ context, location }) => ({
		session: requireRoleFromContext(context, ["admin"], location),
	}),
	head: () => ({
		meta: [
			{ title: "Certificate registry | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: CertificateRegistryRoute,
});

function CertificateRegistryRoute() {
	const { search, status, page } = Route.useSearch();
	return (
		<CertificateRegistryPage
			search={search}
			status={status ?? "all"}
			page={page ?? 1}
		/>
	);
}
