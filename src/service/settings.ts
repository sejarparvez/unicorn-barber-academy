// src/service/settings.ts
// TanStack Query hooks for admin site settings (admin-only).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SettingKey } from "@/lib/settings";
import {
	getSettingsBaseFn,
	updateSettingsFn,
} from "@/server/settings/settings-fns";
import { queryKeys } from "./query-keys";

export function useSettingsBase() {
	return useQuery({
		queryKey: queryKeys.siteSettings(),
		queryFn: (): Promise<Record<SettingKey, string>> => getSettingsBaseFn(),
		staleTime: 60_000,
	});
}

export function useUpdateSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (patch: Partial<Record<SettingKey, string>>) =>
			updateSettingsFn({ data: patch }),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.siteSettings(),
			});
		},
	});
}
