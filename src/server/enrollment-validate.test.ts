import { describe, expect, test } from "bun:test";
import {
	isValidFutureStartDate,
	parseIntakePayload,
	validateApplicationPayload,
} from "@/server/enrollment-validate";

function futureDate(daysAhead = 30): string {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() + daysAhead);
	return d.toISOString().slice(0, 10);
}

describe("validateApplicationPayload", () => {
	test("accepts a clean payload and normalizes", () => {
		const result = validateApplicationPayload({
			intakeId: "12",
			phone: " 01337229944 ",
			experienceNote: "  two years at a salon  ",
			hearAbout: "instagram",
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.intakeId).toBe(12);
			expect(result.value.phone).toBe("01337229944");
			expect(result.value.experienceNote).toBe("two years at a salon");
			expect(result.value.hearAbout).toBe("instagram");
		}
	});

	test("rejects missing/garbage intakeId", () => {
		for (const intakeId of [undefined, "abc", "0", -3]) {
			const result = validateApplicationPayload({
				intakeId,
				phone: "01337229944",
			});
			expect(result.ok).toBe(false);
		}
	});

	test("rejects bad phones", () => {
		for (const phone of ["", "abcd", `+880${"1".repeat(40)}`, "12"]) {
			const result = validateApplicationPayload({ intakeId: 1, phone });
			expect(result.ok).toBe(false);
		}
	});

	test("unknown hearAbout becomes null instead of storing junk", () => {
		const result = validateApplicationPayload({
			intakeId: 1,
			phone: "01337229944",
			hearAbout: "<script>alert(1)</script>",
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.hearAbout).toBeNull();
	});

	test("experience note is capped at 2000 chars", () => {
		const result = validateApplicationPayload({
			intakeId: 1,
			phone: "01337229944",
			experienceNote: "x".repeat(5000),
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.experienceNote?.length).toBe(2000);
	});

	test("non-object bodies are rejected", () => {
		expect(validateApplicationPayload(null).ok).toBe(false);
		expect(validateApplicationPayload("hi").ok).toBe(false);
		expect(validateApplicationPayload(42).ok).toBe(false);
	});
});

describe("isValidFutureStartDate", () => {
	test("accepts real upcoming dates", () => {
		expect(isValidFutureStartDate(futureDate(1))).toBe(true);
		expect(isValidFutureStartDate(futureDate(400))).toBe(true);
	});

	test("rejects malformed strings", () => {
		expect(isValidFutureStartDate("2026/01/01")).toBe(false);
		expect(isValidFutureStartDate("01-01-2026")).toBe(false);
		expect(isValidFutureStartDate("")).toBe(false);
	});

	test("rejects impossible calendar dates like Feb 30", () => {
		expect(isValidFutureStartDate("2027-02-30")).toBe(false);
	});

	test("rejects past dates", () => {
		expect(isValidFutureStartDate("2001-01-01")).toBe(false);
	});
});

describe("parseIntakePayload", () => {
	const validBase = {
		programSlug: "classic-barbering",
		cohort: "day",
		startsOn: futureDate(60),
		seatsTotal: 12,
	};

	test("accepts a clean intake", () => {
		const result = parseIntakePayload(validBase);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.seatsTotal).toBe(12);
	});

	test("rejects unknown programs", () => {
		const result = parseIntakePayload({ ...validBase, programSlug: "welding" });
		expect(result.ok).toBe(false);
	});

	test("rejects bad cohorts", () => {
		const result = parseIntakePayload({ ...validBase, cohort: "midnight" });
		expect(result.ok).toBe(false);
	});

	test("rejects past or invalid start dates", () => {
		expect(
			parseIntakePayload({ ...validBase, startsOn: "2020-01-01" }).ok,
		).toBe(false);
		expect(
			parseIntakePayload({ ...validBase, startsOn: "2027-02-31" }).ok,
		).toBe(false);
	});

	test("seat bounds are enforced (1–200)", () => {
		expect(parseIntakePayload({ ...validBase, seatsTotal: 0 }).ok).toBe(false);
		expect(parseIntakePayload({ ...validBase, seatsTotal: 201 }).ok).toBe(
			false,
		);
		expect(parseIntakePayload({ ...validBase, seatsTotal: 200 }).ok).toBe(true);
	});
});
