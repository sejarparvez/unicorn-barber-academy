// src/server/fn-utils.test.ts
import { describe, expect, test } from "bun:test";
import { AdminAccessError } from "./admin-access-error";
import {
	clampId,
	clampPage,
	clampSearchTerm,
	escapeLike,
	runSafe,
} from "./fn-utils";

describe("clampPage", () => {
	test("returns 1 for valid pages", () => {
		expect(clampPage(1)).toBe(1);
		expect(clampPage(5)).toBe(5);
		expect(clampPage(100)).toBe(100);
	});

	test("clamps to max 10000", () => {
		expect(clampPage(99999)).toBe(10_000);
	});

	test("returns 1 for invalid values", () => {
		expect(clampPage(0)).toBe(1);
		expect(clampPage(-1)).toBe(1);
		expect(clampPage(NaN)).toBe(1);
		expect(clampPage("abc")).toBe(1);
		expect(clampPage(null)).toBe(1);
		expect(clampPage(undefined)).toBe(1);
	});

	test("truncates floats", () => {
		expect(clampPage(3.7)).toBe(3);
		expect(clampPage(1.1)).toBe(1);
	});
});

describe("clampId", () => {
	test("returns valid ids as-is", () => {
		expect(clampId(1)).toBe(1);
		expect(clampId(42)).toBe(42);
		expect(clampId(2_147_483_647)).toBe(2_147_483_647);
	});

	test("returns 0 for invalid ids", () => {
		expect(clampId(0)).toBe(0);
		expect(clampId(-1)).toBe(0);
		expect(clampId(NaN)).toBe(0);
		expect(clampId("abc")).toBe(0);
		expect(clampId(null)).toBe(0);
		expect(clampId(undefined)).toBe(0);
		expect(clampId(2_147_483_648)).toBe(0);
	});

	test("truncates floats", () => {
		expect(clampId(3.9)).toBe(3);
	});
});

describe("clampSearchTerm", () => {
	test("returns trimmed string up to max length", () => {
		expect(clampSearchTerm("hello")).toBe("hello");
		expect(clampSearchTerm("a".repeat(200))).toBe("a".repeat(100));
	});

	test("returns empty string for non-strings", () => {
		expect(clampSearchTerm(123)).toBe("");
		expect(clampSearchTerm(null)).toBe("");
		expect(clampSearchTerm(undefined)).toBe("");
	});

	test("respects custom max", () => {
		expect(clampSearchTerm("hello world", 5)).toBe("hello");
	});
});

describe("escapeLike", () => {
	test("escapes ILIKE metacharacters", () => {
		expect(escapeLike("100%")).toBe("100\\%");
		expect(escapeLike("test_case")).toBe("test\\_case");
		expect(escapeLike("path\\to")).toBe("path\\\\to");
	});

	test("leaves normal text unchanged", () => {
		expect(escapeLike("hello world")).toBe("hello world");
		expect(escapeLike("abc-123")).toBe("abc-123");
	});
});

describe("runSafe", () => {
	test("returns the result of the function", async () => {
		const result = await runSafe(async () => 42);
		expect(result).toBe(42);
	});

	test("throws AdminAccessError directly", async () => {
		try {
			await runSafe(async () => {
				throw new AdminAccessError();
			});
			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(AdminAccessError);
		}
	});

	test("wraps unknown errors in generic message", async () => {
		try {
			await runSafe(async () => {
				throw new Error("pg: connection refused");
			});
			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toBe("Request failed");
		}
	});

	test("lets redirect objects through", async () => {
		const redirect = { statusCode: 302, redirect: "/auth/signin" };
		try {
			await runSafe(async () => {
				throw redirect;
			});
			expect(true).toBe(false);
		} catch (error) {
			expect(error).toBe(redirect);
		}
	});
});
