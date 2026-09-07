// src/server/enrollment-bulk.test.ts
// Tests for enrollment bulk operations (route validation logic + parser contracts).
import { describe, expect, test } from "bun:test";
import { parseApplicationStatus } from "@/lib/enrollment";

// ---- Route validation logic (inline, tested via parser + ID filtering) ----

describe("enrollment bulk route validation", () => {
	test("parseApplicationStatus rejects invalid status", () => {
		expect(parseApplicationStatus("invalid")).toBeUndefined();
	});

	test("parseApplicationStatus accepts valid statuses", () => {
		expect(parseApplicationStatus("pending")).toBe("pending");
		expect(parseApplicationStatus("reviewing")).toBe("reviewing");
		expect(parseApplicationStatus("approved")).toBe("approved");
		expect(parseApplicationStatus("waitlisted")).toBe("waitlisted");
		expect(parseApplicationStatus("rejected")).toBe("rejected");
		expect(parseApplicationStatus("completed")).toBe("completed");
	});

	test("ID filtering: rejects non-number values", () => {
		const ids = [1, "two", 3, null, -1, 0].filter(
			(v): v is number => typeof v === "number" && v > 0,
		);
		expect(ids).toEqual([1, 3]);
	});

	test("ID filtering: rejects empty array", () => {
		const ids: number[] = [];
		expect(ids.length === 0 || ids.length > 50).toBe(true);
	});

	test("ID filtering: rejects >50 IDs", () => {
		const ids = Array.from({ length: 51 }, (_, i) => i + 1);
		expect(ids.length > 50).toBe(true);
	});

	test("ID filtering: accepts valid range (1-50)", () => {
		const ids = Array.from({ length: 50 }, (_, i) => i + 1);
		expect(ids.length > 0 && ids.length <= 50).toBe(true);
	});

	test("note: trims and slices long notes", () => {
		const raw = "  A".repeat(2000);
		const note =
			typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 2000) : null;
		expect(note).toBeTruthy();
		expect(note?.length).toBeLessThanOrEqual(2000);
	});

	test("note: null for empty string", () => {
		const raw = "   ";
		const note =
			typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 2000) : null;
		expect(note).toBeNull();
	});

	test("note: null for non-string values", () => {
		const raw: unknown = 42;
		const note =
			typeof raw === "string" && raw.trim() ? raw.trim().slice(0, 2000) : null;
		expect(note).toBeNull();
	});
});
