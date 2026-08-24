// src/server/console-fns.ts
// Aggregated stats for the admin console overview (/dashboard/admin).
// Read-only domain: pulls across admissions, blog, and certificates so the
// page needs a single loader call instead of one per subsystem.
import { createServerFn } from "@tanstack/react-start";
import type { ApplicationSummary } from "@/lib/enrollment";
import type { BlogStats } from "@/server/blog-db";
import { getPostCountsByStatus } from "@/server/blog-db";
import { countActiveCertificates } from "@/server/certificate-db";
import type { AdmissionsStats } from "@/server/enrollment-db";
import {
	getAdmissionsStats,
	listApplicationsAdmin,
} from "@/server/enrollment-db";
import { runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";

export type ConsoleOverview = {
	admissions: AdmissionsStats;
	blog: BlogStats;
	activeCertificates: number;
	recentApplications: ApplicationSummary[];
};

export const getConsoleOverviewFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ConsoleOverview> => {
		await requireAdminSession();
		return runSafe(async () => {
			const [admissions, blog, activeCertificates, recent] = await Promise.all([
				getAdmissionsStats(),
				getPostCountsByStatus(),
				countActiveCertificates(),
				listApplicationsAdmin({ page: 1, perPage: 8 }),
			]);
			return {
				admissions,
				blog,
				activeCertificates,
				recentApplications: recent.items,
			};
		});
	},
);
