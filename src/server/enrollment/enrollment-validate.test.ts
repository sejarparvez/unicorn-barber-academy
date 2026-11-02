import { describe, expect, test } from "bun:test";
import {
	isValidFutureStartDate,
	parseFeePaymentPayload,
	parseIntakePayload,
	validateApplicationPayload,
} from "@/server/enrollment/enrollment-validate";

function futureDate(daysAhead = 30): string {
	const d = new Date();
	d.setUTCDate(d.getUTCDate() + daysAhead);
	return d.toISOString().slice(0, 10);
}

describe("validateApplicationPayload", () => {
	const basePayload = {
		intakeId: "12",
		fullName: "  Rahim Uddin  ",
		phone: " 01337229944 ",
		fatherName: "Karim Uddin",
		motherName: "Fatema Begum",
		dateOfBirth: "2000-01-01",
		nationality: "Bangladeshi",
		gender: "male",
		presentAddress: "12 Mirpur Road, Dhaka",
		permanentAddress: "12 Mirpur Road, Dhaka",
		emergencyName: "Karim Uddin",
		emergencyRelation: "Father",
		emergencyMobile: "01700000000",
		emergencyAddress: "12 Mirpur Road, Dhaka",
		education: "HSC",
		hasBarberExperience: false,
		hasPriorTraining: false,
		courseGoal: "Open my own barbershop",
		declarationAccepted: true,
	};

	test("accepts a clean payload and normalizes", () => {
		const result = validateApplicationPayload({
			...basePayload,
			nidOrBirthCertNo: " 1990123456789 ",
			whatsapp: " rahim@example.com ",
			hearAbout: "instagram",
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.intakeId).toBe(12);
			expect(result.value.fullName).toBe("Rahim Uddin");
			expect(result.value.phone).toBe("01337229944");
			expect(result.value.gender).toBe("male");
			expect(result.value.nidOrBirthCertNo).toBe("1990123456789");
			expect(result.value.whatsapp).toBe("rahim@example.com");
			expect(result.value.hearAbout).toBe("instagram");
			expect(result.value.hasBarberExperience).toBe(false);
		}
	});

	test("rejects missing/garbage intakeId", () => {
		for (const intakeId of [undefined, "abc", "0", -3]) {
			const result = validateApplicationPayload({
				...basePayload,
				intakeId,
			});
			expect(result.ok).toBe(false);
		}
	});

	test("rejects bad phones", () => {
		for (const phone of ["", "abcd", `+880${"1".repeat(40)}`, "12"]) {
			const result = validateApplicationPayload({ ...basePayload, phone });
			expect(result.ok).toBe(false);
		}
	});

	test("rejects missing required student fields", () => {
		for (const field of [
			"fullName",
			"fatherName",
			"motherName",
			"dateOfBirth",
			"nationality",
			"gender",
			"presentAddress",
			"permanentAddress",
			"emergencyName",
			"emergencyRelation",
			"emergencyMobile",
			"emergencyAddress",
			"education",
			"courseGoal",
		] as const) {
			const result = validateApplicationPayload({
				...basePayload,
				[field]: "",
			});
			expect(result.ok).toBe(false);
		}
	});

	test("rejects a future date of birth", () => {
		const result = validateApplicationPayload({
			...basePayload,
			dateOfBirth: "2099-01-01",
		});
		expect(result.ok).toBe(false);
	});

	test("requires details when experience/training is yes", () => {
		expect(
			validateApplicationPayload({
				...basePayload,
				hasBarberExperience: true,
			}).ok,
		).toBe(false);
		expect(
			validateApplicationPayload({
				...basePayload,
				hasPriorTraining: true,
			}).ok,
		).toBe(false);
		expect(
			validateApplicationPayload({
				...basePayload,
				hasBarberExperience: "yes",
				barberExperiencePeriod: "2 years",
				hasPriorTraining: "yes",
				priorTrainingInstitute: "Dhaka Barber School",
			}).ok,
		).toBe(true);
	});

	test("requires the declaration", () => {
		expect(
			validateApplicationPayload({
				...basePayload,
				declarationAccepted: false,
			}).ok,
		).toBe(false);
	});

	test("unknown hearAbout becomes null instead of storing junk", () => {
		const result = validateApplicationPayload({
			...basePayload,
			hearAbout: "<script>alert(1)</script>",
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.hearAbout).toBeNull();
	});

	test("course goal is capped at 2000 chars", () => {
		const result = validateApplicationPayload({
			...basePayload,
			courseGoal: "x".repeat(5000),
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.courseGoal.length).toBe(2000);
	});

	test("non-object bodies are rejected", () => {
		expect(validateApplicationPayload(null).ok).toBe(false);
		expect(validateApplicationPayload("hi").ok).toBe(false);
		expect(validateApplicationPayload(42).ok).toBe(false);
	});

	test("accepts empty optional fields", () => {
		const result = validateApplicationPayload({
			...basePayload,
			nidOrBirthCertNo: "",
			whatsapp: "",
			hearAbout: "",
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.nidOrBirthCertNo).toBeNull();
			expect(result.value.whatsapp).toBeNull();
			expect(result.value.hearAbout).toBeNull();
		}
	});

	test("phone with special characters is accepted", () => {
		const result = validateApplicationPayload({
			...basePayload,
			phone: "+880 (133) 722-9944",
		});
		expect(result.ok).toBe(true);
	});

	test("intakeId as string number is coerced", () => {
		const result = validateApplicationPayload({
			...basePayload,
			intakeId: "42",
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.intakeId).toBe(42);
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
	const t = test.skipIf(!process.env.DATABASE_URL);
	const validBase = {
		programSlug: "classic-barbering",
		cohort: "day",
		startsOn: futureDate(60),
		seatsTotal: 12,
	};

	t("accepts a clean intake", async () => {
		const result = await parseIntakePayload(validBase);
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.seatsTotal).toBe(12);
	});

	t("rejects unknown programs", async () => {
		const result = await parseIntakePayload({
			...validBase,
			programSlug: "welding",
		});
		expect(result.ok).toBe(false);
	});

	t("rejects bad cohorts", async () => {
		const result = await parseIntakePayload({
			...validBase,
			cohort: "midnight",
		});
		expect(result.ok).toBe(false);
	});

	t("rejects past or invalid start dates", async () => {
		expect(
			(await parseIntakePayload({ ...validBase, startsOn: "2020-01-01" })).ok,
		).toBe(false);
		expect(
			(await parseIntakePayload({ ...validBase, startsOn: "2027-02-31" })).ok,
		).toBe(false);
	});

	t("seat bounds are enforced (1–200)", async () => {
		expect((await parseIntakePayload({ ...validBase, seatsTotal: 0 })).ok).toBe(
			false,
		);
		expect(
			(await parseIntakePayload({ ...validBase, seatsTotal: 201 })).ok,
		).toBe(false);
		expect(
			(await parseIntakePayload({ ...validBase, seatsTotal: 200 })).ok,
		).toBe(true);
	});
});

describe("parseFeePaymentPayload", () => {
	test("accepts taka amount with method", () => {
		const result = parseFeePaymentPayload({
			amountTaka: 15000,
			method: "bkash",
			receiptRef: "TRX123",
		});
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.value.amountPoisha).toBe(1500000);
	});

	test("rejects bad amounts, methods, future dates", () => {
		expect(parseFeePaymentPayload({ amountTaka: 0, method: "cash" }).ok).toBe(
			false,
		);
		expect(
			parseFeePaymentPayload({ amountTaka: 5000, method: "card" }).ok,
		).toBe(false);
		expect(
			parseFeePaymentPayload({
				amountTaka: 5000,
				method: "cash",
				paidAt: "2099-01-01",
			}).ok,
		).toBe(false);
	});
});
