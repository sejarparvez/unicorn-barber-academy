// src/server/settings-fns.ts
// Public read (cached client-side) + admin-only write for site settings.
import { createServerFn } from "@tanstack/react-start";
import type { ResolvedSettings, SettingKey } from "@/lib/settings";
import { logAdminAction } from "@/server/audit/audit-log";
import { runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import {
	getBaseValues,
	getSiteSettings,
	updateSiteSettings,
} from "@/server/settings/settings-db";
import { parseSettingsPatch } from "@/server/settings/settings-validate";

export const getSiteSettingsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ResolvedSettings> => runSafe(() => getCachedSiteSettings()),
);

const SETTINGS_TTL_MS = 5 * 60_000;
let settingsCache: { value: ResolvedSettings; at: number } | null = null;

/** In-memory 5-min cache: settings change only via admin writes, which
    invalidate through updateSettingsFn below. */
export async function getCachedSiteSettings(): Promise<ResolvedSettings> {
	if (settingsCache && Date.now() - settingsCache.at < SETTINGS_TTL_MS)
		return settingsCache.value;
	const value = await getSiteSettings();
	settingsCache = { value, at: Date.now() };
	return value;
}

export function invalidateSettingsCache(): void {
	settingsCache = null;
}

export const getSettingsBaseFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<Record<SettingKey, string>> => {
		await requireAdminSession();
		return runSafe(() => getBaseValues());
	},
);

export const updateSettingsFn = createServerFn({ method: "POST" })
	.validator((input: Record<string, unknown>) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const parsed = parseSettingsPatch(data);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => updateSiteSettings(parsed.value));
		if (!result.ok) throw new Error("Unknown setting key");
		invalidateSettingsCache();
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "settings.update",
			targetType: "settings",
			targetId: Object.keys(parsed.value).join(","),
			summary: `Updated site settings: ${Object.keys(parsed.value).join(", ")}`,
			metadata: { keys: Object.keys(parsed.value) },
		});
		return { ok: true };
	});
