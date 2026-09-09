// src/server/settings-fns.ts
// Public read (cached client-side) + admin-only write for site settings.
import { createServerFn } from "@tanstack/react-start";
import type { ResolvedSettings, SettingKey } from "@/lib/settings";
import { runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import {
	getBaseValues,
	getSiteSettings,
	updateSiteSettings,
} from "@/server/settings-db";
import { parseSettingsPatch } from "@/server/settings-validate";

export const getSiteSettingsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ResolvedSettings> => runSafe(() => getSiteSettings()),
);

export const getSettingsBaseFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<Record<SettingKey, string>> => {
		await requireAdminSession();
		return runSafe(() => getBaseValues());
	},
);

export const updateSettingsFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		await requireAdminSession();
		const parsed = parseSettingsPatch(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => updateSiteSettings(parsed.value));
		if (!result.ok) throw new Error("Unknown setting key");
		return { ok: true };
	});
