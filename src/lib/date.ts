/**
 * Timezone-safe helpers for working with DATE-only values (YYYY-MM-DD).
 *
 * Postgres `date` columns are parsed by node-pg into a JS Date at *local*
 * midnight, and `toISOString()` renders UTC — combining both shifts dates
 * back a day on servers east of UTC. Always convert DATE values through
 * these helpers instead of `toISOString().slice(0, 10)`.
 */

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

/** Normalize a DATE column value (raw "YYYY-MM-DD" string or JS Date) to "YYYY-MM-DD" using local calendar parts. */
export function toDateOnly(value: Date | string): string {
	if (typeof value === "string") return value.slice(0, 10);
	const year = value.getFullYear();
	const month = pad(value.getMonth() + 1);
	const day = pad(value.getDate());
	return `${year}-${month}-${day}`;
}

/* ---------------------------------------------------------------------- */
/* Display formatting — single source of truth, built on date-fns.        */
/* Previously copy-pasted across ~10 files with drifting output.          */
/* ---------------------------------------------------------------------- */

import { format } from "date-fns";

/**
 * Build a Date at *local* midnight for a DATE-only string ("2026-03-01").
 * Local-in/local-out guarantees the calendar date never shifts, unlike
 * toISOString/parseISO which mix UTC into the pipeline.
 */
function dateFromDayValue(value: string): Date | null {
	const [y, m, d] = value
		.slice(0, 10)
		.split("-")
		.map((part) => Number.parseInt(part, 10));
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
}

/** "2026-03-01" → "Mar 1, 2026" (short month). */
export function formatDateOnly(value: string): string {
	const date = dateFromDayValue(value);
	return date ? format(date, "MMM d, yyyy") : value;
}

/** "2026-03-01" → "March 1, 2026" (long month — certificates, blog dates). */
export function formatLongDate(value: string): string {
	const date = dateFromDayValue(value);
	return date ? format(date, "MMMM d, yyyy") : value;
}

/**
 * ISO timestamp → "Mar 1, 2026" (en-US medium date). Used for blog post
 * published/updated dates; renders in the viewer's local time.
 */
export function formatMediumDate(value: string | Date): string {
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return String(value);
	return format(date, "MMM d, yyyy");
}
