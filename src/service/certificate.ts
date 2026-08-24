// src/service/certificate.ts
// TanStack Query hooks for certificates. Reads wrap session-scoped server
// functions; admin mutations invalidate the affected application detail,
// the lists, and the console stats.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	issueCertificate,
	setCertificateRevoked,
} from "@/lib/api/certificate-admin";
import type { CertificateRecord } from "@/lib/certificates";
import { queryKeys } from "./query-keys";

export function useMyCertificates(options?: {
	initialData?: CertificateRecord[];
}) {
	return useQuery({
		queryKey: queryKeys.certificates(),
		queryFn: async (): Promise<CertificateRecord[]> => {
			const { listMyCertificatesFn } = await import("@/server/certificate-fns");
			return listMyCertificatesFn();
		},
		initialData: options?.initialData,
	});
}

export function useApplicationCertificate(applicationId: number) {
	return useQuery({
		queryKey: queryKeys.applicationCertificate(applicationId),
		queryFn: async (): Promise<CertificateRecord | null> => {
			const { getCertificateForApplicationFn } = await import(
				"@/server/certificate-fns"
			);
			return getCertificateForApplicationFn({
				data: { applicationId },
			});
		},
	});
}

export function useIssueCertificate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (applicationId: number) =>
			issueCertificate(applicationId),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.certificates(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.applications(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.consoleOverview(),
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
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.certificates(),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.consoleOverview(),
			});
		},
	});
}
