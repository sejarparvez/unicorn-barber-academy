// src/service/audit.ts
// TanStack Query hooks for the admin activity viewer (admin-only, read-only).
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AuditListResult } from "@/lib/audit";
import { queryKeys } from "./query-keys";

export type AuditFilters = {
	actorId?: number;
	action?: string;
	page?: number;
};

export function useAuditLog(filters: AuditFilters) {
	return useQuery({
		queryKey: queryKeys.auditLog(filters),
		queryFn: async (): Promise<AuditListResult> => {
			const { listAuditLogFn } = await import("@/server/audit/audit-fns");
			return listAuditLogFn({ data: filters });
		},
		placeholderData: keepPreviousData,
		staleTime: 15_000,
	});
}
