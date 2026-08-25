import { describe, expect, test } from "bun:test";
import { isAdmin, isStaff, parseRole, ROLES } from "@/lib/roles";

describe("parseRole", () => {
	test("accepts every declared role", () => {
		for (const role of ROLES) {
			expect(parseRole(role)).toBe(role);
		}
	});

	test("rejects unknown values", () => {
		expect(parseRole("superuser")).toBeUndefined();
		expect(parseRole("Admin")).toBeUndefined(); // case-sensitive on purpose
	});

	test("rejects null/undefined/non-strings", () => {
		expect(parseRole(null)).toBeUndefined();
		expect(parseRole(undefined)).toBeUndefined();
		expect(parseRole(42 as unknown as string)).toBeUndefined();
	});
});

describe("isStaff", () => {
	test("admin and instructor are staff", () => {
		expect(isStaff("admin")).toBe(true);
		expect(isStaff("instructor")).toBe(true);
	});

	test("user and student are not staff", () => {
		expect(isStaff("student")).toBe(false);
		expect(isStaff("user")).toBe(false);
		expect(isStaff(undefined)).toBe(false);
	});
});

describe("isAdmin", () => {
	test("only admin passes", () => {
		expect(isAdmin("admin")).toBe(true);
		expect(isAdmin("instructor")).toBe(false);
	});
});
