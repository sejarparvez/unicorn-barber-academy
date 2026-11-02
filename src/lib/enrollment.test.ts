import { describe, expect, test } from "bun:test";
import {
	APPLICATION_STATUS_LABELS,
	APPLICATION_STATUSES,
	APPLICATION_TRANSITIONS,
	calculateAge,
	formatStartsOn,
	generateReference,
	parseApplicationStatus,
	parseGender,
	SEAT_HOLDING_STATUSES,
} from "@/lib/enrollment";

describe("parseApplicationStatus", () => {
	test("accepts every status including completed", () => {
		for (const status of APPLICATION_STATUSES) {
			expect(parseApplicationStatus(status)).toBe(status);
		}
	});

	test("rejects junk from the wire", () => {
		expect(parseApplicationStatus("PENDING")).toBeUndefined();
		expect(parseApplicationStatus("done")).toBeUndefined();
		expect(parseApplicationStatus(null)).toBeUndefined();
		expect(parseApplicationStatus(7)).toBeUndefined();
	});
});

describe("APPLICATION_STATUS_LABELS", () => {
	test("has a label for every status (compile-time contract)", () => {
		for (const status of APPLICATION_STATUSES) {
			expect(typeof APPLICATION_STATUS_LABELS[status]).toBe("string");
			expect(APPLICATION_STATUS_LABELS[status].length).toBeGreaterThan(0);
		}
	});
});

describe("APPLICATION_TRANSITIONS", () => {
	test("only targets known statuses and never self-transitions", () => {
		for (const status of APPLICATION_STATUSES) {
			for (const target of APPLICATION_TRANSITIONS[status]) {
				expect(APPLICATION_STATUSES).toContain(target);
				expect(target).not.toBe(status);
			}
		}
	});

	test("graduates only from approved, and terminal states are final", () => {
		expect(APPLICATION_TRANSITIONS.approved).toContain("completed");
		expect(APPLICATION_TRANSITIONS.pending).not.toContain("completed");
		expect(APPLICATION_TRANSITIONS.rejected).toEqual([]);
		expect(APPLICATION_TRANSITIONS.completed).toEqual([]);
	});
});

describe("SEAT_HOLDING_STATUSES", () => {
	test("holds seats pre-decision and while enrolled, not after", () => {
		expect(SEAT_HOLDING_STATUSES).toContain("pending");
		expect(SEAT_HOLDING_STATUSES).toContain("reviewing");
		expect(SEAT_HOLDING_STATUSES).toContain("approved");
		expect(SEAT_HOLDING_STATUSES).not.toContain("waitlisted");
		expect(SEAT_HOLDING_STATUSES).not.toContain("rejected");
		// A graduate frees their seat for the next cohort.
		expect(SEAT_HOLDING_STATUSES).not.toContain("completed");
	});
});

describe("generateReference", () => {
	test("matches ENR-XXXXXX with an unambiguous alphabet", () => {
		for (let i = 0; i < 50; i++) {
			const ref = generateReference();
			expect(ref).toMatch(/^ENR-[A-HJ-NP-Z2-9]{6}$/);
		}
	});

	test("no ambiguous characters (I/L/O/0/1)", () => {
		for (let i = 0; i < 100; i++) {
			const ref = generateReference();
			expect(ref).not.toMatch(/[ILO01]/);
		}
	});
});

describe("formatStartsOn", () => {
	test("formats yyyy-mm-dd in UTC regardless of local timezone", () => {
		expect(formatStartsOn("2026-03-01")).toBe("Mar 1, 2026");
	});

	test("returns input unchanged for garbage", () => {
		expect(formatStartsOn("not-a-date")).toBe("not-a-date");
	});
});

describe("calculateAge", () => {
	test("counts whole years after the birthday has passed", () => {
		expect(calculateAge("2000-01-15", new Date(2026, 0, 15))).toBe(26);
	});

	test("does not count the current year before the birthday", () => {
		expect(calculateAge("2000-12-31", new Date(2026, 0, 15))).toBe(25);
	});

	test("returns null for an invalid or future-looking date", () => {
		expect(calculateAge("")).toBeNull();
		expect(calculateAge("2026-02-30")).toBeNull();
		expect(calculateAge("2099-01-01", new Date(2026, 0, 15))).toBeNull();
	});
});

describe("parseGender", () => {
	test("accepts known genders and rejects junk", () => {
		expect(parseGender("male")).toBe("male");
		expect(parseGender("female")).toBe("female");
		expect(parseGender("other")).toBe("other");
		expect(parseGender("MALE")).toBeUndefined();
		expect(parseGender(null)).toBeUndefined();
	});
});
