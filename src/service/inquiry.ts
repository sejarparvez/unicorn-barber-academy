// src/service/inquiry.ts
// TanStack Query hooks for the admin contact inbox (admin-only).
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { InquiryListResult } from "@/lib/inquiry";
import { queryKeys } from "./query-keys";

export function useInquiries(unreadOnly: boolean, page: number) {
	return useQuery({
		queryKey: queryKeys.inquiries({ unreadOnly, page }),
		queryFn: async (): Promise<InquiryListResult> => {
			const { listInquiriesFn } = await import("@/server/inquiry/inquiry-fns");
			return listInquiriesFn({ data: { unreadOnly, page } });
		},
		placeholderData: keepPreviousData,
		staleTime: 15_000,
	});
}

function useInvalidateInbox() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: queryKeys.inquiries() });
	};
}

export function useMarkInquiry() {
	const invalidate = useInvalidateInbox();
	return useMutation({
		mutationFn: async (input: {
			id: number;
			patch: { isRead?: boolean; isReplied?: boolean };
		}) => {
			const { markInquiryFn } = await import("@/server/inquiry/inquiry-fns");
			await markInquiryFn({ data: input });
		},
		onSuccess: () => invalidate(),
	});
}

export function useDeleteInquiry() {
	const invalidate = useInvalidateInbox();
	return useMutation({
		mutationFn: async (id: number) => {
			const { deleteInquiryFn } = await import("@/server/inquiry/inquiry-fns");
			await deleteInquiryFn({ data: { id } });
		},
		onSuccess: () => invalidate(),
	});
}
