// src/service/audit.ts
// TanStack Query hooks for the admin activity viewer (admin-only, read-only).
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AuditListResult } from "@/lib/audit";
import { listAuditLogFn } from "@/server/audit/audit-fns";
import { queryKeys } from "./query-keys";

export type AuditFilters = {
	actorId?: number;
	action?: string;
	page?: number;
};

export function useAuditLog(filters: AuditFilters) {
	return useQuery({
		queryKey: queryKeys.auditLog(filters),
		queryFn: (): Promise<AuditListResult> => listAuditLogFn({ data: filters }),
		placeholderData: keepPreviousData,
		staleTime: 15_000,
	});
}
