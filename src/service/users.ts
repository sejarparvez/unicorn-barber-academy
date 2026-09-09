// src/service/users.ts
// TanStack Query hooks for admin user management (admin-only).
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { Role } from "@/lib/roles";
import type { ListUsersResult } from "@/lib/users";
import { queryKeys } from "./query-keys";

export type UserFilters = {
	search?: string;
	role?: Role;
	banned?: boolean;
	page?: number;
};

export function useUsersList(filters: UserFilters) {
	return useQuery({
		queryKey: queryKeys.users(filters),
		queryFn: async (): Promise<ListUsersResult> => {
			const { listUsersAdminFn } = await import("@/server/users-fns");
			return listUsersAdminFn({ data: filters });
		},
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}

export function useSetUserRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: { targetId: number; role: Role }) => {
			const { setUserRoleFn } = await import("@/server/users-fns");
			await setUserRoleFn({ data: input });
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.users() });
		},
	});
}

export function useSetUserBan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: {
			targetId: number;
			banned: boolean;
			banReason?: string | null;
			banExpiresDays?: number | null;
		}) => {
			const { setUserBanFn } = await import("@/server/users-fns");
			await setUserBanFn({ data: input });
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.users() });
		},
	});
}
