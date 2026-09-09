// src/service/settings.ts
// TanStack Query hooks for admin site settings (admin-only).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SettingKey } from "@/lib/settings";
import { queryKeys } from "./query-keys";

export function useSettingsBase() {
	return useQuery({
		queryKey: queryKeys.siteSettings(),
		queryFn: async (): Promise<Record<SettingKey, string>> => {
			const { getSettingsBaseFn } = await import(
				"@/server/settings/settings-fns"
			);
			return getSettingsBaseFn();
		},
		staleTime: 60_000,
	});
}

export function useUpdateSettings() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (patch: Partial<Record<SettingKey, string>>) => {
			const { updateSettingsFn } = await import(
				"@/server/settings/settings-fns"
			);
			await updateSettingsFn({ data: patch });
		},
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: queryKeys.siteSettings(),
			});
		},
	});
}
