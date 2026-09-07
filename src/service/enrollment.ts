// src/service/enrollment.ts
// TanStack Query hooks for the enrollment system. Reads wrap the server
// functions (they run over HTTP automatically during client navigation);
// mutations invalidate precisely instead of re-running every loader.
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	bulkSetStatus,
	setApplicationFee,
	setApplicationStatus,
} from "@/lib/api/enrollment-admin";
import type {
	ApplicationDetail,
	ApplicationStatus,
	Cohort,
	FeeStatus,
	IntakeAdmin,
} from "@/lib/enrollment";
import { queryKeys } from "./query-keys";

/* -------------------------------- reads --------------------------------- */

type ListFilters = {
	status?: ApplicationStatus;
	search?: string;
	programSlug?: string;
	cohort?: Cohort;
	feeStatus?: FeeStatus;
	page?: number;
};
type ListPage = {
	items: import("@/lib/enrollment").ApplicationSummary[];
	total: number;
	page: number;
	totalPages: number;
};

/** Admin applications table. `initialData` primes the cache from the route
    loader so deep links still paint instantly; filter changes then fetch
    client-side under their own keys. */
export function useApplicationsList(
	filters: ListFilters,
	options?: { initialData?: ListPage },
) {
	return useQuery({
		queryKey: queryKeys.applications(filters),
		queryFn: async (): Promise<ListPage> => {
			const { listApplicationsAdminFn } = await import(
				"@/server/enrollment-fns"
			);
			const result = await listApplicationsAdminFn({ data: filters });
			return result;
		},
		initialData: options?.initialData,
		staleTime: 30_000,
		placeholderData: keepPreviousData,
	});
}

export function useApplicationDetail(
	id: number,
	options?: { initialData?: { application: ApplicationDetail } },
) {
	return useQuery({
		queryKey: queryKeys.application(id),
		queryFn: async (): Promise<{ application: ApplicationDetail }> => {
			const { getApplicationAdminFn } = await import("@/server/enrollment-fns");
			return (await getApplicationAdminFn({ data: { id } })) as {
				application: ApplicationDetail;
			};
		},
		initialData: options?.initialData,
		staleTime: 60_000,
	});
}

export function useIntakesAdmin(options?: { initialData?: IntakeAdmin[] }) {
	return useQuery({
		queryKey: queryKeys.intakes(),
		queryFn: async (): Promise<IntakeAdmin[]> => {
			const { listIntakesAdminFn } = await import("@/server/enrollment-fns");
			return listIntakesAdminFn();
		},
		initialData: options?.initialData,
		staleTime: 30_000,
	});
}

/* ------------------------------ mutations ------------------------------- */

function useInvalidateEnrollment() {
	const queryClient = useQueryClient();
	return {
		invalidateLists: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.applications(),
			});
			void queryClient.invalidateQueries({ queryKey: queryKeys.intakes() });
		},
		invalidateApplication: (id: number) => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.application(id),
			});
			void queryClient.invalidateQueries({
				queryKey: queryKeys.applications(),
			});
			void queryClient.invalidateQueries({ queryKey: queryKeys.intakes() });
			// Approval flips role to student → their dashboard list may change.
			void queryClient.invalidateQueries({
				queryKey: queryKeys.myApplications(),
			});
			// Dashboard overview shows enrollment stats that change on mutations.
			void queryClient.invalidateQueries({
				queryKey: queryKeys.consoleOverview(),
			});
		},
	};
}

export function useSetApplicationStatus(id: number) {
	const { invalidateApplication } = useInvalidateEnrollment();
	return useMutation({
		mutationFn: async (input: {
			status: ApplicationStatus;
			note?: string | null;
		}) => setApplicationStatus(id, input.status, input.note ?? null),
		onSuccess: () => invalidateApplication(id),
	});
}

export function useSetApplicationFee(id: number) {
	const { invalidateApplication } = useInvalidateEnrollment();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (paid: boolean) => setApplicationFee(id, paid),
		onMutate: async (paid) => {
			await queryClient.cancelQueries({
				queryKey: queryKeys.application(id),
			});
			await queryClient.cancelQueries({ queryKey: queryKeys.applications() });
			const prevDetail = queryClient.getQueryData(queryKeys.application(id));
			const prevLists = queryClient.getQueriesData({
				queryKey: queryKeys.applications(),
			});
			const newFeeStatus = paid ? "paid" : "unpaid";
			queryClient.setQueryData(
				queryKeys.application(id),
				(old: { application: ApplicationDetail } | undefined) => {
					if (!old) return old;
					return {
						...old,
						application: { ...old.application, feeStatus: newFeeStatus },
					};
				},
			);
			queryClient.setQueriesData(
				{ queryKey: queryKeys.applications() },
				(old: ListPage | undefined) => {
					if (!old) return old;
					return {
						...old,
						items: old.items.map((item) =>
							item.id === id ? { ...item, feeStatus: newFeeStatus } : item,
						),
					};
				},
			);
			return { prevDetail, prevLists };
		},
		onError: (_err, _paid, context) => {
			if (context?.prevDetail) {
				queryClient.setQueryData(queryKeys.application(id), context.prevDetail);
			}
			if (context?.prevLists) {
				for (const [key, data] of context.prevLists) {
					queryClient.setQueryData(key, data);
				}
			}
		},
		onSettled: () => invalidateApplication(id),
	});
}

export function useCreateIntake() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			programSlug: string;
			cohort: string;
			startsOn: string;
			seatsTotal: number;
		}) => {
			const { createIntake } = await import("@/lib/api/enrollment-admin");
			await createIntake(input);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.intakes() });
			void queryClient.invalidateQueries({ queryKey: queryKeys.openIntakes() });
		},
	});
}

export function useUpdateIntake() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			id: number;
			patch: { startsOn?: string; seatsTotal?: number; isOpen?: boolean };
		}) => {
			const { updateIntake } = await import("@/lib/api/enrollment-admin");
			await updateIntake(input.id, input.patch);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.intakes() });
			void queryClient.invalidateQueries({ queryKey: queryKeys.openIntakes() });
		},
	});
}

export function useDeleteIntake() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			const { deleteIntake } = await import("@/lib/api/enrollment-admin");
			await deleteIntake(id);
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.intakes() });
			void queryClient.invalidateQueries({ queryKey: queryKeys.openIntakes() });
		},
	});
}

export function useBulkSetApplicationStatus() {
	const { invalidateLists } = useInvalidateEnrollment();
	return useMutation({
		mutationFn: async (input: {
			ids: number[];
			status: ApplicationStatus;
			note?: string | null;
		}) => bulkSetStatus(input.ids, input.status, input.note ?? null),
		onSuccess: () => invalidateLists(),
	});
}

export function useApplicationStatusLog(applicationId: number) {
	return useQuery({
		queryKey: queryKeys.applicationLog(applicationId),
		queryFn: async () => {
			const { listApplicationStatusLogFn } = await import(
				"@/server/enrollment-fns"
			);
			return listApplicationStatusLogFn({ data: { applicationId } });
		},
	});
}
