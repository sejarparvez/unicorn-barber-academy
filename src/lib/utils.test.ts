import { describe, expect, test } from "bun:test";
import { cn, getInitials } from "@/lib/utils";

describe("getInitials", () => {
	test("single word", () => {
		expect(getInitials("Rafiq")).toBe("R");
	});

	test("two words takes first letters", () => {
		expect(getInitials("Farhana Rahman")).toBe("FR");
	});

	test("multi-word uses first and last word", () => {
		expect(getInitials("Md. Rakibul Hasan")).toBe("MH");
	});

	test("extra whitespace between words", () => {
		expect(getInitials("A   B")).toBe("AB");
	});

	test("leading/trailing whitespace", () => {
		expect(getInitials("  Rafiq  ")).toBe("R");
	});

	test("whitespace-only string returns empty (regression: used to throw)", () => {
		expect(getInitials("   ")).toBe("");
	});

	test("null and undefined return empty", () => {
		expect(getInitials(null)).toBe("");
		expect(getInitials(undefined)).toBe("");
	});

	test("empty string returns empty", () => {
		expect(getInitials("")).toBe("");
	});

	test("lowercase input is uppercased", () => {
		expect(getInitials("rafiq hasan")).toBe("RH");
	});
});

describe("cn", () => {
	test("joins class names", () => {
		expect(cn("a", "b")).toBe("a b");
	});

	test("drops falsy values", () => {
		const inactive = false;
		expect(cn("a", inactive && "b", undefined, null, "d")).toBe("a d");
	});

	test("tailwind-merge resolves conflicting utilities last-wins", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});
});
