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
import {
	listUsersAdminFn,
	setUserBanFn,
	setUserRoleFn,
} from "@/server/users/users-fns";
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
		queryFn: (): Promise<ListUsersResult> =>
			listUsersAdminFn({ data: filters }),
		placeholderData: keepPreviousData,
		staleTime: 30_000,
	});
}

export function useSetUserRole() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: { targetId: number; role: Role }) =>
			setUserRoleFn({ data: input }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.users() });
		},
	});
}

export function useSetUserBan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: {
			targetId: number;
			banned: boolean;
			banReason?: string | null;
			banExpiresDays?: number | null;
		}) => setUserBanFn({ data: input }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: queryKeys.users() });
		},
	});
}
