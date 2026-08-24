// src/server/enrollment-validate.ts
// Manual payload validation for enrollment endpoints — house style (no schema
// library), mirrors blog-validate.ts. Returns normalized values.
import { ALL_PROGRAMS } from "@/data/programs";
import type { Cohort } from "@/lib/enrollment";

const HTTP_PHONE = /^[+]?[\d\s\-()]{7,20}$/;

export type ValidationResult<T> =
	| { ok: true; value: T }
	| { ok: false; message: string };

function str(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

export function validateApplicationPayload(body: unknown): ValidationResult<{
	intakeId: number;
	phone: string;
	experienceNote: string | null;
	hearAbout: string | null;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;

	const intakeId = Number.parseInt(String(b.intakeId ?? ""), 10);
	if (!Number.isInteger(intakeId) || intakeId < 1) {
		return { ok: false, message: "Please choose a cohort" };
	}

	const phone = str(b.phone);
	if (!HTTP_PHONE.test(phone)) {
		return {
			ok: false,
			message: "Enter a valid phone number (e.g. +880 1XXX-XXXXXX)",
		};
	}

	const hearAboutAllowed = [
		"friend",
		"facebook",
		"instagram",
		"search",
		"walkby",
		"other",
	];
	const hearAboutRaw = str(b.hearAbout);
	const hearAbout = hearAboutAllowed.includes(hearAboutRaw)
		? hearAboutRaw
		: null;

	return {
		ok: true,
		value: {
			intakeId,
			phone,
			experienceNote: str(b.experienceNote).slice(0, 2000) || null,
			hearAbout,
		},
	};
}

// yyyy-mm-dd only; must not be in the past. Shared by intake create and
// PATCH so an edit can't move a live cohort into the past.
export function isValidFutureStartDate(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
	const [y, m, d] = value.split("-").map(Number.parseInt);
	const start = new Date(Date.UTC(y, m - 1, d));
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	return (
		start.getUTCFullYear() === y &&
		start.getUTCMonth() === m - 1 &&
		start.getUTCDate() === d &&
		start >= today
	);
}

export function parseIntakePayload(body: unknown): ValidationResult<{
	programSlug: string;
	cohort: Cohort;
	startsOn: string;
	seatsTotal: number;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;

	const programSlug = str(b.programSlug);
	if (!ALL_PROGRAMS.some((p) => p.slug === programSlug)) {
		return { ok: false, message: "Unknown program" };
	}

	const cohort = str(b.cohort);
	if (cohort !== "day" && cohort !== "evening") {
		return { ok: false, message: "Cohort must be day or evening" };
	}

	// yyyy-mm-dd only; must not be in the past.
	const startsOn = str(b.startsOn);
	if (!isValidFutureStartDate(startsOn)) {
		return { ok: false, message: "Start date must be a valid future date" };
	}

	const seatsTotal = Number.parseInt(String(b.seatsTotal ?? ""), 10);
	if (!Number.isInteger(seatsTotal) || seatsTotal < 1 || seatsTotal > 200) {
		return { ok: false, message: "Seats must be between 1 and 200" };
	}

	return {
		ok: true,
		value: { programSlug, cohort, startsOn, seatsTotal },
	};
}
