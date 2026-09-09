import { describe, expect, test } from "bun:test";
import { parseSettingsPatch } from "@/server/settings/settings-validate";

describe("parseSettingsPatch", () => {
	test("accepts a valid contact patch", () => {
		const result = parseSettingsPatch({
			contact_email: "hello@example.com",
			contact_phone: "01337229944",
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.contact_phone).toBe("01337229944");
		}
	});

	test("normalizes phone digits", () => {
		const result = parseSettingsPatch({ contact_phone: "01337-229944" });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.contact_phone).toBe("01337229944");
	});

	test("rejects bad email and short phones", () => {
		expect(parseSettingsPatch({ contact_email: "nope" }).ok).toBe(false);
		expect(parseSettingsPatch({ contact_phone: "123" }).ok).toBe(false);
	});

	test("hours detail needs pipe-separated lines", () => {
		expect(parseSettingsPatch({ hours_detail: "just text" }).ok).toBe(false);
		expect(
			parseSettingsPatch({ hours_detail: "Sat – Thu | 9AM – 9PM" }).ok,
		).toBe(true);
	});

	test("announcement link must be relative or https", () => {
		expect(
			parseSettingsPatch({ announcement_to: "javascript:alert(1)" }).ok,
		).toBe(false);
		expect(parseSettingsPatch({ announcement_to: "/enroll" }).ok).toBe(true);
		expect(parseSettingsPatch({ announcement_text: "" }).ok).toBe(true);
	});

	test("rejects empty patches and garbage bodies", () => {
		expect(parseSettingsPatch({}).ok).toBe(false);
		expect(parseSettingsPatch(null).ok).toBe(false);
	});
});
