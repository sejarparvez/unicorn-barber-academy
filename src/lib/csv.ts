// src/lib/csv.ts
// CSV cell serialization shared by exports. Pure so it is unit-testable:
// formula injection (=, +, -, @, tab, CR prefixes) is neutralized with a
// leading apostrophe before quoting — applicant-controlled values must
// never execute as spreadsheet formulas.
export function csvCell(value: string | number): string {
	const text = String(value);
	const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
	return `"${safe.replaceAll('"', '""')}"`;
}
