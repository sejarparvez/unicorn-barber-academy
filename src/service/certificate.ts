// src/service/certificate.ts
// TanStack Query hooks for certificates. Reads wrap session-scoped server
// functions; admin mutations invalidate the affected application detail,
// the lists, and the console stats.
//
// NOTE: server functions MUST stay behind dynamic `await import()` here.
// Static imports pull `pg`/`dotenv` (via *-db.ts) into the browser bundle
// and crash every page that uses these hooks.
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	issueCertificate,
	setCertificateRevoked,
} from "@/lib/api/certificate-admin";
import type {
	AdminCertificateList,
	CertificateListFilters,
	CertificateRecord,
} from "@/lib/certificates";
import { queryKeys } from "./query-keys";

/** Admin registry: every issued credential, searchable and paginated. */
export function useAdminCertificates(filters: CertificateListFilters) {
	return useQuery({
		queryKey: queryKeys.adminCertificates(filters),
		queryFn: async (): Promise<AdminCertificateList> => {
			const { listCertificatesAdminFn } = await import(
				"@/server/certificate/certificate-fns"
			);
			return listCertificatesAdminFn({ data: filters });
		},
		placeholderData: keepPreviousData,
		staleTime: 15_000,
	});
}

export function useApplicationCertificate(applicationId: number) {
	return useQuery({
		queryKey: queryKeys.applicationCertificate(applicationId),
		queryFn: async (): Promise<CertificateRecord | null> => {
			const { getCertificateForApplicationFn } = await import(
				"@/server/certificate/certificate-fns"
			);
			return getCertificateForApplicationFn({
				data: { applicationId },
			});
		},
		staleTime: 60_000,
	});
}

export function useIssueCertificate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (applicationId: number) =>
			issueCertificate(applicationId),
		onSuccess: (_data, applicationId) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.certificates(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.applications(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.consoleOverview(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.applicationCertificate(applicationId),
			});
		},
	});
}

export function useSetCertificateRevocation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			id: number;
			revoked: boolean;
			reason?: string | null;
		}) => setCertificateRevoked(input.id, input.revoked, input.reason),
		onSuccess: (_data, input) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.certificates(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.consoleOverview(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.certificate(input.id),
			});
		},
	});
}
