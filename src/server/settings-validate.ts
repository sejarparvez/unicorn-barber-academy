// src/server/settings-validate.ts
// Manual payload validation for the site-settings endpoint (house style).
import type { SettingKey } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/settings";
import type { ValidationResult } from "./validate-utils";
import { str } from "./validate-utils";

export type { ValidationResult } from "./validate-utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseSettingsPatch(
	body: unknown,
): ValidationResult<Partial<Record<SettingKey, string>>> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const patch: Partial<Record<SettingKey, string>> = {};

	for (const key of SETTING_KEYS) {
		if (b[key] === undefined) continue;
		const value = str(b[key]).trim();
		switch (key) {
			case "contact_email":
				if (!EMAIL.test(value) || value.length > 200) {
					return { ok: false, message: "Contact email is invalid" };
				}
				patch[key] = value;
				break;
			case "contact_phone": {
				const digits = value.replace(/[^0-9]/g, "");
				if (digits.length < 10 || digits.length > 15) {
					return { ok: false, message: "Phone must hold 10–15 digits" };
				}
				patch[key] = digits;
				break;
			}
			case "address_street":
			case "address_locality":
				if (!value || value.length > 200) {
					return { ok: false, message: `${key} must be 1–200 characters` };
				}
				patch[key] = value;
				break;
			case "address_postal":
				if (!value || value.length > 20) {
					return { ok: false, message: "Postal code must be 1–20 characters" };
				}
				patch[key] = value;
				break;
			case "address_country":
				if (!value || value.length > 80) {
					return { ok: false, message: "Country must be 1–80 characters" };
				}
				patch[key] = value;
				break;
			case "hours_summary":
				if (!value || value.length > 160) {
					return {
						ok: false,
						message: "Hours summary must be 1–160 characters",
					};
				}
				patch[key] = value;
				break;
			case "hours_detail": {
				if (!value || value.length > 1000) {
					return {
						ok: false,
						message: "Hours detail must be 1–1000 characters",
					};
				}
				const lines = value
					.split("\n")
					.map((l) => l.trim())
					.filter(Boolean);
				if (lines.length === 0 || !lines.every((l) => l.includes("|"))) {
					return { ok: false, message: 'Hours need "Days | Time" lines' };
				}
				patch[key] = lines.join("\n");
				break;
			}
			case "areas_served": {
				if (!value || value.length > 500) {
					return { ok: false, message: "Areas must be 1–500 characters" };
				}
				patch[key] = value;
				break;
			}
			case "announcement_text":
				if (value.length > 200) {
					return {
						ok: false,
						message: "Announcement must be under 200 characters",
					};
				}
				patch[key] = value;
				break;
			case "announcement_to":
				if (value.length > 200) {
					return {
						ok: false,
						message: "Announcement link must be under 200 characters",
					};
				}
				if (value && !value.startsWith("/") && !value.startsWith("https://")) {
					return {
						ok: false,
						message: "Announcement link must start with / or https://",
					};
				}
				patch[key] = value;
				break;
		}
	}

	if (Object.keys(patch).length === 0) {
		return { ok: false, message: "Nothing to update" };
	}
	return { ok: true, value: patch };
}
