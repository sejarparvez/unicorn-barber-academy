// src/lib/enrollment.ts
// Client-safe enrollment domain types + helpers crossing the server/client
// boundary (same contract style as lib/blog.ts / lib/roles.ts).
import { formatDateOnly } from "./date";

export const APPLICATION_STATUSES = [
	"pending",
	"reviewing",
	"approved",
	"waitlisted",
	"rejected",
	"completed",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function parseApplicationStatus(
	value: unknown,
): ApplicationStatus | undefined {
	return typeof value === "string" &&
		(APPLICATION_STATUSES as readonly string[]).includes(value)
		? (value as ApplicationStatus)
		: undefined;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
	pending: "Pending",
	reviewing: "In review",
	approved: "Approved",
	waitlisted: "Waitlisted",
	rejected: "Not accepted",
	completed: "Completed",
};

/** Statuses that hold one of the intake's seats. */
export const SEAT_HOLDING_STATUSES: readonly ApplicationStatus[] = [
	"pending",
	"reviewing",
	"approved",
] as const;

export type FeeStatus = "unpaid" | "paid";
export const FEE_STATUSES = ["unpaid", "paid"] as const;

export const FEE_METHODS = ["bkash", "cash", "bank"] as const;
export type FeeMethod = (typeof FEE_METHODS)[number];

export function parseFeeMethod(value: unknown): FeeMethod | undefined {
	return typeof value === "string" &&
		(FEE_METHODS as readonly string[]).includes(value)
		? (value as FeeMethod)
		: undefined;
}

export const FEE_METHOD_LABELS: Record<FeeMethod, string> = {
	bkash: "bKash",
	cash: "Cash",
	bank: "Bank transfer",
};

/** One offline payment row against an application. */
export type FeePaymentRow = {
	id: number;
	amountPoisha: number;
	method: FeeMethod;
	receiptRef: string | null;
	receivedByName: string | null;
	paidAt: string;
};

export type Cohort = "day" | "evening";
export const COHORTS = ["day", "evening"] as const;

export function parseCohort(value: unknown): Cohort | undefined {
	return typeof value === "string" &&
		(COHORTS as readonly string[]).includes(value)
		? (value as Cohort)
		: undefined;
}

export function parseFeeStatus(value: unknown): FeeStatus | undefined {
	return typeof value === "string" &&
		(FEE_STATUSES as readonly string[]).includes(value)
		? (value as FeeStatus)
		: undefined;
}

export const COHORT_LABELS: Record<Cohort, string> = {
	day: "Day cohort",
	evening: "Evening cohort",
};

/** Public projection of an open intake for the application form. */
export type IntakePublic = {
	id: number;
	programSlug: string;
	programTitle: string;
	track: "barbering" | "beauty";
	cohort: Cohort;
	startsOn: string; // yyyy-mm-dd
	seatsTotal: number;
	seatsLeft: number;
	feePoisha: number;
};

/** Applicant's own view of their application. */
export type MyApplication = {
	id: number;
	reference: string;
	status: ApplicationStatus;
	feeStatus: FeeStatus;
	programTitle: string;
	programSlug: string;
	cohort: Cohort;
	startsOn: string;
	submittedAt: string;
};

/** Admin table row. */
export type ApplicationSummary = {
	id: number;
	reference: string;
	status: ApplicationStatus;
	feeStatus: FeeStatus;
	fullName: string;
	email: string;
	phone: string;
	programTitle: string;
	programSlug: string;
	cohort: Cohort;
	startsOn: string;
	userId: number;
	userRole: string | null;
	submittedAt: string;
};

/** Full detail for the admin decision page. */
export type ApplicationDetail = ApplicationSummary & {
	experienceNote: string | null;
	hearAbout: string | null;
	decidedAt: string | null;
	decisionNote: string | null;
	intakeId: number;
	intakeOpen: boolean;
	seatsTotal: number;
	seatsOccupied: number;
	updatedAt: string;
	programFeePoisha: number;
	feePaidPoisha: number;
	payments: FeePaymentRow[];
};

export type IntakeAdmin = {
	id: number;
	programSlug: string;
	programTitle: string;
	track: "barbering" | "beauty";
	cohort: Cohort;
	startsOn: string; // yyyy-mm-dd
	seatsTotal: number;
	seatsLeft: number;
	isOpen: boolean;
	applicationsCount: number;
	seatsWarning: boolean; // true when seats_left is negative (data integrity issue)
};

/** Published program option for dropdowns (intake create, apply form). */
export type ProgramOption = {
	slug: string;
	title: string;
	track: "barbering" | "beauty";
	feePoisha: number;
	defaultSeats: number;
};

/** Admin program row with live overview stats. */
export type ProgramAdmin = {
	slug: string;
	title: string;
	track: "barbering" | "beauty";
	duration: string;
	feePoisha: number;
	defaultSeats: number;
	isPublished: boolean;
	openIntakes: number;
	seatsTotal: number;
	seatsFilled: number;
	pendingCount: number;
	collectedPoisha: number;
};

/** 4500000 → "৳45,000". Fees are stored as integer poisha (1 BDT = 100). */
export function formatFeePoisha(poisha: number): string {
	const bdt = Math.floor(poisha / 100);
	return `৳${bdt.toLocaleString("en-US")}`;
}

/* ------------------------------ helpers -------------------------------- */

const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I/L/O/0/1

/** ENR-XXXXXX — opaque, unambiguous when read aloud. Caller retries on the
    astronomically-rare collision. */
export function generateReference(): string {
	let out = "";
	for (let i = 0; i < 6; i++) {
		out +=
			REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
	}
	return `ENR-${out}`;
}

/** Delegates to the shared date helper — kept as a domain alias so
    enrollment call sites read naturally. UTC-pinned, "Mar 1, 2026". */
export function formatStartsOn(iso: string): string {
	return formatDateOnly(iso);
}
