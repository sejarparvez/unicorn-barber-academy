import { describe, expect, test } from "bun:test";
import { AREAS_SERVED, CONTACT } from "@/data/site";
import {
	defaultBaseValues,
	formatPhoneDisplay,
	resolveSettings,
	toE164,
} from "@/lib/settings";

describe("phone derivation", () => {
	test("formats BD mobile display style", () => {
		expect(formatPhoneDisplay("01337229944")).toBe("01337-229944");
		expect(formatPhoneDisplay("123")).toBe("123");
	});

	test("normalizes E164", () => {
		expect(toE164("01337229944")).toBe("+8801337229944");
		expect(toE164("8801337229944")).toBe("+8801337229944");
	});
});

describe("resolveSettings", () => {
	test("defaults resolve byte-identical to data/site.ts CONTACT", () => {
		const s = resolveSettings(defaultBaseValues());
		expect(s.contact.email).toBe(CONTACT.email);
		expect(s.contact.phoneDisplay).toBe(CONTACT.phoneDisplay);
		expect(s.contact.phoneHref).toBe(CONTACT.phoneHref);
		expect(s.contact.phoneE164).toBe(CONTACT.phoneE164);
		expect(s.contact.whatsapp).toBe(CONTACT.whatsapp);
		expect(s.contact.addressDisplay).toBe(CONTACT.addressDisplay);
		expect(s.contact.mapsUrl).toBe(CONTACT.mapsUrl);
		expect(s.contact.mapsEmbedUrl).toBe(CONTACT.mapsEmbedUrl);
		expect(s.contact.hoursSummary).toBe(CONTACT.hoursSummary);
		expect(s.contact.hours).toEqual(CONTACT.hours);
		expect(s.areasServed).toEqual([...AREAS_SERVED]);
		expect(s.announcement).toBeNull();
	});

	test("DB values overlay defaults per-key", () => {
		const s = resolveSettings({
			...defaultBaseValues(),
			contact_phone: "01700000000",
		});
		expect(s.contact.phoneDisplay).toBe("01700-000000");
		expect(s.contact.email).toBe(CONTACT.email);
	});

	test("blank DB values fall back to defaults (never blank NAP)", () => {
		const s = resolveSettings({ ...defaultBaseValues(), contact_email: "  " });
		expect(s.contact.email).toBe(CONTACT.email);
	});
});
