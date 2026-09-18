// src/server/console-fns.ts
// Aggregated stats for the admin console overview (/dashboard/admin).
// Read-only domain: pulls across admissions, blog, and certificates so the
// page needs a single loader call instead of one per subsystem.
import { createServerFn } from "@tanstack/react-start";
import type { ConsoleOverview } from "@/lib/console";
import { requireAdminSession } from "@/server/admin-guard.server";
import { getPostCountsByStatus } from "@/server/blog/blog-db";
import { countActiveCertificates } from "@/server/certificate/certificate-db";
import {
	getAdmissionsStats,
	getApplicationsByProgram,
	getApplicationsSince,
	getApplicationsTimeline,
	getFeeRevenueByMonth,
	listApplicationsAdmin,
} from "@/server/enrollment/enrollment-db";
import { runSafe } from "@/server/fn-utils";

export type { ConsoleOverview } from "@/lib/console";

export const getConsoleOverviewFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ConsoleOverview> => {
		await requireAdminSession();
		return runSafe(async () => {
			const [
				admissions,
				blog,
				activeCertificates,
				recent,
				timeline,
				byProgram,
				feeRevenueByMonth,
				deltas,
			] = await Promise.all([
				getAdmissionsStats(),
				getPostCountsByStatus(),
				countActiveCertificates(),
				listApplicationsAdmin({ page: 1, perPage: 8 }),
				getApplicationsTimeline(),
				getApplicationsByProgram(),
				getFeeRevenueByMonth(),
				getApplicationsSince(),
			]);
			return {
				admissions,
				blog,
				activeCertificates,
				recentApplications: recent.items,
				timeline,
				byProgram,
				feeRevenueByMonth,
				deltas,
			};
		});
	},
);
