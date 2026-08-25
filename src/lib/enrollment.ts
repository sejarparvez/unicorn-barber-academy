// src/lib/enrollment.ts
// Client-safe enrollment domain types + helpers crossing the server/client
// boundary (same contract style as lib/blog.ts / lib/roles.ts).

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
export type Cohort = "day" | "evening";

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
};

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

export function formatStartsOn(iso: string): string {
	const [y, m, d] = iso.split("-").map((part) => Number.parseInt(part, 10));
	if (!y || !m || !d) return iso;
	return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	});
}
