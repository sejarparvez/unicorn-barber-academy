// src/server/settings-db.ts
// Server-only data access for site settings. Reads merge DB rows over the
// code defaults in src/data/site.ts per-key, so an empty table renders
// byte-identical and a bad row can never blank the site's NAP data.
import {
	defaultBaseValues,
	type ResolvedSettings,
	resolveSettings,
	SETTING_KEYS,
	type SettingKey,
} from "@/lib/settings";
import { db } from "../db";

export async function getBaseValues(): Promise<Record<SettingKey, string>> {
	const res = await db().query<{ key: string; value: string }>(
		"SELECT key, value FROM site_setting",
	);
	const base = defaultBaseValues();
	for (const row of res.rows) {
		if ((SETTING_KEYS as readonly string[]).includes(row.key)) {
			base[row.key as SettingKey] = row.value;
		}
	}
	return base;
}

/** Public resolved settings for UI + JSON-LD (single shared object). */
export async function getSiteSettings(): Promise<ResolvedSettings> {
	return resolveSettings(await getBaseValues());
}

export type SettingsMutationResult =
	| { ok: true }
	| { ok: false; reason: "unknown-key" };

/** Upsert validated base values. Validation lives in settings-validate.ts. */
export async function updateSiteSettings(
	patch: Partial<Record<SettingKey, string>>,
): Promise<SettingsMutationResult> {
	for (const [key, value] of Object.entries(patch)) {
		if (!(SETTING_KEYS as readonly string[]).includes(key)) {
			return { ok: false, reason: "unknown-key" };
		}
		await db().query(
			`INSERT INTO site_setting (key, value, updated_at)
			 VALUES ($1, $2, now())
			 ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
			[key, value],
		);
	}
	return { ok: true };
}
