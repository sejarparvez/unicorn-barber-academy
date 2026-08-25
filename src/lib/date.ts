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

/** Today's date in the server's local timezone as "YYYY-MM-DD". */
export function todayDateOnly(): string {
	return toDateOnly(new Date());
}
