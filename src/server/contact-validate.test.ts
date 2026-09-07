// src/server/contact-validate.test.ts
import { describe, expect, test } from "bun:test";
import { CONTACT_SUBJECTS } from "@/data/contact";
import { validateContactInput } from "@/server/contact-validate";

const validInput = {
	name: "Rahim Uddin",
	email: "rahim@example.com",
	phone: "+880 1712-345678",
	program: "Professional Barbering",
	message: "I would like to enroll in the next cohort.",
	subject: "student",
};

describe("validateContactInput", () => {
	test("accepts valid input", () => {
		const result = validateContactInput(validInput);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.name).toBe("Rahim Uddin");
			expect(result.email).toBe("rahim@example.com");
			expect(result.subject).toBe("student");
		}
	});

	test("rejects missing name", () => {
		const result = validateContactInput({ ...validInput, name: "" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.message).toBe("All required fields must be filled");
	});

	test("rejects missing email", () => {
		const result = validateContactInput({ ...validInput, email: "" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.message).toBe("All required fields must be filled");
	});

	test("rejects missing subject", () => {
		const result = validateContactInput({ ...validInput, subject: "" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.message).toBe("All required fields must be filled");
	});

	test("rejects missing message", () => {
		const result = validateContactInput({ ...validInput, message: "" });
		expect(result.ok).toBe(false);
		if (!result.ok)
			expect(result.message).toBe("All required fields must be filled");
	});

	test("rejects invalid email format", () => {
		const result = validateContactInput({
			...validInput,
			email: "not-an-email",
		});
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).toBe("Invalid email format");
	});

	test("rejects email without domain", () => {
		const result = validateContactInput({ ...validInput, email: "user@" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).toBe("Invalid email format");
	});

	test("rejects invalid phone number", () => {
		const result = validateContactInput({ ...validInput, phone: "123" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).toBe("Invalid phone number");
	});

	test("allows empty phone (optional)", () => {
		const result = validateContactInput({ ...validInput, phone: "" });
		expect(result.ok).toBe(true);
	});

	test("rejects invalid subject", () => {
		const result = validateContactInput({ ...validInput, subject: "spam" });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.message).toBe("Invalid subject");
	});

	test("accepts all valid subjects", () => {
		for (const subject of CONTACT_SUBJECTS) {
			const result = validateContactInput({ ...validInput, subject });
			expect(result.ok).toBe(true);
		}
	});

	test("trims and slices long values", () => {
		const longName = "A".repeat(200);
		const result = validateContactInput({ ...validInput, name: longName });
		expect(result.ok).toBe(true);
		if (result.ok) expect(result.name.length).toBe(120);
	});

	test("handles non-string values gracefully", () => {
		const result = validateContactInput({
			name: 123,
			email: true,
			phone: null,
			program: undefined,
			message: {},
			subject: 42,
		});
		expect(result.ok).toBe(false);
	});

	test("strips whitespace from inputs", () => {
		const result = validateContactInput({
			...validInput,
			name: "  Rahim  ",
			email: "  rahim@example.com  ",
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.name).toBe("Rahim");
			expect(result.email).toBe("rahim@example.com");
		}
	});
});
