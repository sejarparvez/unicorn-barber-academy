// src/server/validate-utils.ts
// Shared validation helpers for the manual payload validators
// (enrollment-validate.ts, blog-validate.ts, contact-validate.ts).
// House style: no schema library — plain functions return normalised values.

export type ValidationResult<T> =
	| { ok: true; value: T }
	| { ok: false; message: string };

/** Coerce an unknown value to a trimmed string. */
export function str(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

/** Coerce to trimmed string or null (for optional text fields). */
export function nullableStr(value: unknown, max: number): string | null {
	const s = str(value);
	if (!s) return null;
	return s.slice(0, max);
}
