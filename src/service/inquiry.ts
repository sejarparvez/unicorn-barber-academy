// src/service/inquiry.ts
// TanStack Query hooks for the admin contact inbox (admin-only).
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { InquiryListResult } from "@/lib/inquiry";
import {
	deleteInquiryFn,
	listInquiriesFn,
	markInquiryFn,
} from "@/server/inquiry/inquiry-fns";
import { queryKeys } from "./query-keys";

export function useInquiries(unreadOnly: boolean, page: number) {
	return useQuery({
		queryKey: queryKeys.inquiries({ unreadOnly, page }),
		queryFn: (): Promise<InquiryListResult> =>
			listInquiriesFn({ data: { unreadOnly, page } }),
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
		mutationFn: (input: {
			id: number;
			patch: { isRead?: boolean; isReplied?: boolean };
		}) => markInquiryFn({ data: input }),
		onSuccess: () => invalidate(),
	});
}

export function useDeleteInquiry() {
	const invalidate = useInvalidateInbox();
	return useMutation({
		mutationFn: (id: number) => deleteInquiryFn({ data: { id } }),
		onSuccess: () => invalidate(),
	});
}
