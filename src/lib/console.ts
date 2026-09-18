// src/lib/console.ts
// Client-safe contract for the admin console (/dashboard/admin). Loaded by
// the route's server function (src/server/console-fns.ts) and typed here so
// dashboard feature components can consume it without importing @/server/*.
import type {
	ApplicationStatus,
	ApplicationSummary,
	IntakeAdmin,
} from "./enrollment";

export type AdmissionsStats = {
	byStatus: Record<ApplicationStatus, number>;
	total: number;
	/** Open intakes that have not started yet, soonest first. */
	upcomingOpenIntakes: IntakeAdmin[];
};

export type BlogStats = { draft: number; published: number; archived: number };

export type TimelinePoint = {
	/** ISO `YYYY-MM` bucket label. */
	month: string;
	count: number;
};

export type ProgramApplications = {
	programTitle: string;
	count: number;
};

export type FeeRevenuePoint = {
	/** ISO `YYYY-MM` bucket label. */
	month: string;
	amountPoisha: number;
};

export type ApplicationDeltas = {
	total: number;
	needsReview: number;
	approved: number;
};

export type ConsoleOverview = {
	admissions: AdmissionsStats;
	blog: BlogStats;
	activeCertificates: number;
	recentApplications: ApplicationSummary[];
	/** Monthly application submissions, last 12 months, zero-filled. */
	timeline: TimelinePoint[];
	/** Application counts by program, most-popular first. */
	byProgram: ProgramApplications[];
	/** Monthly fee revenue collected, last 12 months, zero-filled. */
	feeRevenueByMonth: FeeRevenuePoint[];
	/** Submission counts for the trailing 7-day window (trend chips). */
	deltas: ApplicationDeltas;
};
