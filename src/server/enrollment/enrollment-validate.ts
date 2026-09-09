// src/server/enrollment-validate.ts
// Manual payload validation for enrollment endpoints — house style (no schema
// library), mirrors blog-validate.ts. Returns normalized values.
import { type Cohort, parseFeeMethod } from "@/lib/enrollment";
import { isProgramLive } from "@/server/program/program-db";
import type { ValidationResult } from "../validate-utils";
import { str } from "../validate-utils";

const HTTP_PHONE = /^[+]?[\d\s\-()]{7,20}$/;

export type { ValidationResult } from "../validate-utils";

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
	const [y, m, d] = value.split("-").map((part) => Number.parseInt(part, 10));
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

export async function parseIntakePayload(body: unknown): Promise<
	ValidationResult<{
		programSlug: string;
		cohort: Cohort;
		startsOn: string;
		seatsTotal: number;
	}>
> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;

	const programSlug = str(b.programSlug);
	if (!programSlug) {
		return { ok: false, message: "Unknown program" };
	}
	// Slug must exist in the program table and be published — the DB catalog
	// (seeded from src/data/programs.ts) is the source of truth, not code.
	if (!(await isProgramLive(programSlug))) {
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

/** Offline payment in whole taka (converted to poisha by the caller). */
export function parseFeePaymentPayload(body: unknown): ValidationResult<{
	amountPoisha: number;
	method: string;
	receiptRef: string | null;
	paidAt: string | null;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const taka = Number.parseInt(String(b.amountTaka ?? ""), 10);
	if (!Number.isInteger(taka) || taka < 1 || taka > 1_000_000) {
		return { ok: false, message: "Amount must be ৳1–৳1,000,000" };
	}
	const method = parseFeeMethod(str(b.method));
	if (!method)
		return { ok: false, message: "Method must be bKash, cash, or bank" };
	const receiptRef = str(b.receiptRef).slice(0, 120) || null;
	let paidAt: string | null = null;
	const rawDate = str(b.paidAt);
	if (rawDate) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
			return { ok: false, message: "Date must be yyyy-mm-dd" };
		}
		if (new Date(`${rawDate}T00:00:00Z`) > new Date()) {
			return { ok: false, message: "Payment date cannot be in the future" };
		}
		paidAt = rawDate;
	}
	return {
		ok: true,
		value: { amountPoisha: taka * 100, method, receiptRef, paidAt },
	};
}

/** Admin program patch: fee in poisha (integer ≥ 0), seats 1–200. */
export function parseProgramPatch(body: unknown): ValidationResult<{
	title?: string;
	duration?: string;
	feePoisha?: number;
	defaultSeats?: number;
	isPublished?: boolean;
}> {
	if (typeof body !== "object" || body === null) {
		return { ok: false, message: "Invalid request body" };
	}
	const b = body as Record<string, unknown>;
	const value: {
		title?: string;
		duration?: string;
		feePoisha?: number;
		defaultSeats?: number;
		isPublished?: boolean;
	} = {};

	if (b.title !== undefined) {
		const title = str(b.title).slice(0, 200);
		if (!title) return { ok: false, message: "Title cannot be empty" };
		value.title = title;
	}
	if (b.duration !== undefined) {
		const duration = str(b.duration).slice(0, 40);
		if (!duration) return { ok: false, message: "Duration cannot be empty" };
		value.duration = duration;
	}
	if (b.feePoisha !== undefined) {
		const fee = Number.parseInt(String(b.feePoisha), 10);
		if (!Number.isInteger(fee) || fee < 0 || fee > 100_000_000) {
			return { ok: false, message: "Fee must be between ৳0 and ৳1,000,000" };
		}
		value.feePoisha = fee;
	}
	if (b.defaultSeats !== undefined) {
		const seats = Number.parseInt(String(b.defaultSeats), 10);
		if (!Number.isInteger(seats) || seats < 1 || seats > 200) {
			return { ok: false, message: "Seats must be between 1 and 200" };
		}
		value.defaultSeats = seats;
	}
	if (b.isPublished !== undefined) {
		if (typeof b.isPublished !== "boolean") {
			return { ok: false, message: "isPublished must be a boolean" };
		}
		value.isPublished = b.isPublished;
	}
	return { ok: true, value };
}
