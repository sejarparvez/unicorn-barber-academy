// src/lib/date.test.ts
import { describe, expect, test } from "bun:test";
import {
	formatDateOnly,
	formatLongDate,
	formatMediumDate,
	toDateOnly,
} from "@/lib/date";

describe("toDateOnly", () => {
	test("extracts YYYY-MM-DD from Date object using local time", () => {
		// Month is 0-indexed in Date constructor: 2 = March
		const d = new Date(2026, 2, 15); // March 15, 2026 local
		expect(toDateOnly(d)).toBe("2026-03-15");
	});

	test("slices first 10 chars from ISO string", () => {
		expect(toDateOnly("2026-03-15T10:30:00Z")).toBe("2026-03-15");
	});

	test("returns short string as-is", () => {
		expect(toDateOnly("2026-12-31")).toBe("2026-12-31");
	});

	test("handles single-digit month/day with padding", () => {
		const d = new Date(2026, 0, 5); // January 5
		expect(toDateOnly(d)).toBe("2026-01-05");
	});
});

describe("formatDateOnly", () => {
	test("formats valid date string to short month", () => {
		expect(formatDateOnly("2026-03-01")).toBe("Mar 1, 2026");
	});

	test("formats year-end date", () => {
		expect(formatDateOnly("2026-12-31")).toBe("Dec 31, 2026");
	});

	test("returns raw input for invalid string", () => {
		expect(formatDateOnly("not-a-date")).toBe("not-a-date");
	});

	test("handles year-only input gracefully", () => {
		// "2026" splits into [2026, NaN, NaN] → returns raw
		expect(formatDateOnly("2026")).toBe("2026");
	});
});

describe("formatLongDate", () => {
	test("formats valid date to long month", () => {
		expect(formatLongDate("2026-03-01")).toBe("March 1, 2026");
	});

	test("formats January correctly", () => {
		expect(formatLongDate("2026-01-15")).toBe("January 15, 2026");
	});

	test("returns raw input for invalid string", () => {
		expect(formatLongDate("invalid")).toBe("invalid");
	});
});

describe("formatMediumDate", () => {
	test("formats ISO timestamp string", () => {
		// Use a fixed UTC timestamp to avoid timezone issues in tests
		expect(formatMediumDate("2026-03-01T00:00:00Z")).toBe("Mar 1, 2026");
	});

	test("formats Date object", () => {
		const d = new Date(2026, 2, 1); // March 1, 2026 local
		expect(formatMediumDate(d)).toBe("Mar 1, 2026");
	});

	test("returns String(value) for invalid date", () => {
		expect(formatMediumDate("not-a-date")).toBe("not-a-date");
	});

	test("handles invalid Date object", () => {
		const d = new Date("invalid");
		expect(formatMediumDate(d)).toBe("Invalid Date");
	});
});
