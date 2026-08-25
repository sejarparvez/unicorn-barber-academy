import { describe, expect, test } from "bun:test";
import {
	clampId,
	clampPage,
	clampSearchTerm,
	runSafe,
} from "@/server/fn-utils";

describe("clampPage", () => {
	test("accepts valid integers", () => {
		expect(clampPage(1)).toBe(1);
		expect(clampPage(42)).toBe(42);
	});

	test("garbage falls back to page 1 (regression: NaN used to hit the DB)", () => {
		expect(clampPage(Number.NaN)).toBe(1);
		expect(clampPage(undefined)).toBe(1);
		expect(clampPage("3" as unknown as number)).toBe(1);
		expect(clampPage(1.5)).toBe(1);
	});

	test("zero and negatives clamp to 1", () => {
		expect(clampPage(0)).toBe(1);
		expect(clampPage(-5)).toBe(1);
	});

	test("absurd values are capped to prevent huge OFFSETs", () => {
		expect(clampPage(99_999_999)).toBe(10_000);
	});
});

describe("clampId", () => {
	test("valid ids pass through", () => {
		expect(clampId(7)).toBe(7);
		expect(clampId(2_147_483_647)).toBe(2_147_483_647);
	});

	test("garbage returns 0 so callers treat it as not-found", () => {
		expect(clampId(Number.NaN)).toBe(0);
		expect(clampId(-1)).toBe(0);
		expect(clampId("x" as unknown as number)).toBe(0);
		expect(clampId(9_999_999_999)).toBe(0); // beyond int4 range
	});
});

describe("clampSearchTerm", () => {
	test("caps length", () => {
		expect(clampSearchTerm("a".repeat(500)).length).toBe(100);
		expect(clampSearchTerm("a".repeat(20), 10).length).toBe(10);
	});

	test("non-strings become empty", () => {
		expect(clampSearchTerm(undefined)).toBe("");
		expect(clampSearchTerm(123 as unknown as string)).toBe("");
	});
});

describe("runSafe", () => {
	test("passes through successful results", async () => {
		expect(await runSafe(async () => 21)).toBe(21);
	});

	test("masks thrown errors behind a generic message", async () => {
		const logs: unknown[][] = [];
		const original = console.error;
		console.error = (...args: unknown[]) => {
			logs.push(args);
		};
		let message = "";
		try {
			await runSafe(async () => {
				throw new Error('relation "secret_table" does not exist');
			});
		} catch (error) {
			message = (error as Error).message;
		} finally {
			console.error = original;
		}
		expect(message).toBe("Request failed");
		expect(message).not.toContain("secret_table");
		// The real error was still logged server-side for debugging.
		const loggedError = logs[0]?.[1] as Error;
		expect(loggedError?.message).toContain("secret_table");
	});
});
