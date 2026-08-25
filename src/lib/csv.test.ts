import { describe, expect, test } from "bun:test";
import { csvCell } from "@/lib/csv";

describe("csvCell — formula injection regression", () => {
	test("plain values are quoted", () => {
		expect(csvCell("Farhana")).toBe('"Farhana"');
		expect(csvCell(42)).toBe('"42"');
	});

	test("double quotes are doubled", () => {
		expect(csvCell('say "hi"')).toBe('"say ""hi"""');
	});

	test.each([
		"=cmd",
		"+sum",
		"-2+3",
		"@import",
		"\tTabbed",
		"\rCR",
	])("dangerous leading character %j is neutralized with a leading apostrophe", (prefix) => {
		const cell = csvCell(`${prefix}payload`);
		expect(cell.startsWith(`"'`)).toBe(true);
		expect(cell.endsWith(`"${prefix}payload"`)).toBe(false);
	});

	test("phone numbers starting with + survive readable but inert", () => {
		const cell = csvCell("+8801337229944");
		expect(cell).toBe("\"'+" + '8801337229944"');
	});

	test("benign internal minus is still guarded (starts-with rule)", () => {
		// "-value" would be parsed as a formula by Excel; we guard it.
		expect(csvCell("-5")).toBe('"\'-5"');
	});
});
