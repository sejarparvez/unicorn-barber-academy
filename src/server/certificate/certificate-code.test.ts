// src/server/certificate/certificate-code.test.ts
import { describe, expect, test } from "bun:test";
import { generateCertificateCode } from "./certificate-code";

const CODE_PATTERN = /^UBT-\d{4}-[0-9A-HJKMNP-TV-Z]{8}$/;

describe("generateCertificateCode", () => {
	test("uses the expected year and suffix format", () => {
		expect(generateCertificateCode(new Date("2026-11-08T00:00:00Z"))).toMatch(
			/^UBT-2026-[0-9A-HJKMNP-TV-Z]{8}$/,
		);
	});

	test("never uses ambiguous letters", () => {
		for (let i = 0; i < 200; i++) {
			const code = generateCertificateCode();
			expect(code).toMatch(CODE_PATTERN);
			expect(code.slice(-8)).not.toMatch(/[ILOU]/);
		}
	});

	test("does not repeat in a small sample", () => {
		const codes = new Set(
			Array.from({ length: 500 }, () => generateCertificateCode()),
		);
		expect(codes.size).toBe(500);
	});
});
