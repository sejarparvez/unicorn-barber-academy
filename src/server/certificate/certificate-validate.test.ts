import { describe, expect, test } from "bun:test";
import {
	parseCertificateListFilters,
	parseVerifyUrl,
} from "@/server/certificate/certificate-validate";

const ORIGIN = "https://example.com";

describe("parseCertificateListFilters", () => {
	test("defaults for empty input", () => {
		expect(parseCertificateListFilters(undefined)).toEqual({
			search: "",
			status: "all",
			page: 1,
		});
		expect(parseCertificateListFilters(null)).toEqual({
			search: "",
			status: "all",
			page: 1,
		});
	});

	test("trims and caps the search term", () => {
		const parsed = parseCertificateListFilters({
			search: `  ${"a".repeat(200)}  `,
		});
		expect(parsed.search).toHaveLength(120);
		expect(parsed.search).not.toStartWith(" ");
	});

	test("accepts known statuses and rejects junk", () => {
		expect(parseCertificateListFilters({ status: "active" }).status).toBe(
			"active",
		);
		expect(parseCertificateListFilters({ status: "revoked" }).status).toBe(
			"revoked",
		);
		expect(parseCertificateListFilters({ status: "all" }).status).toBe("all");
		expect(parseCertificateListFilters({ status: "bogus" }).status).toBe("all");
	});

	test("normalises the page from numbers and strings", () => {
		expect(parseCertificateListFilters({ page: 3 }).page).toBe(3);
		expect(parseCertificateListFilters({ page: "4" }).page).toBe(4);
		expect(parseCertificateListFilters({ page: 0 }).page).toBe(1);
		expect(parseCertificateListFilters({ page: -2 }).page).toBe(1);
		expect(parseCertificateListFilters({ page: "nope" }).page).toBe(1);
		expect(parseCertificateListFilters({ page: 99_999 }).page).toBe(10_000);
	});
});

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
