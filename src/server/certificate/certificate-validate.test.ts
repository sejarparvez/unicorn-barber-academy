import { describe, expect, test } from "bun:test";
import { parseVerifyUrl } from "@/server/certificate/certificate-validate";

const ORIGIN = "https://example.com";

describe("parseVerifyUrl", () => {
	test("accepts valid verify URL", () => {
		const r = parseVerifyUrl(`${ORIGIN}/verify/ABC-123`, ORIGIN, "example.com");
		expect(r.ok).toBe(true);
	});
	test("rejects foreign origin", () => {
		const r = parseVerifyUrl(
			"https://evil.com/verify/ABC-123",
			ORIGIN,
			"example.com",
		);
		expect(r.ok).toBe(false);
	});
	test("rejects bad path and overlong", () => {
		expect(parseVerifyUrl(`${ORIGIN}/blog/x`, ORIGIN, "example.com").ok).toBe(
			false,
		);
		expect(
			parseVerifyUrl(
				`${ORIGIN}/verify/${"A".repeat(300)}`,
				ORIGIN,
				"example.com",
			).ok,
		).toBe(false);
	});
});
