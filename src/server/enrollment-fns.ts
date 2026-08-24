// src/server/enrollment-fns.ts
// Server-function wrappers around enrollment-db for TanStack Router loaders
// (same pattern as blog-fns.ts — client-side navigations must re-run these
// on the server). Every handler is a public RPC endpoint: admin fns guard
// the session in-handler, and all DB work runs through runSafe so driver
// errors never reach the client.
import { createServerFn } from "@tanstack/react-start";
import type {
	ApplicationStatus,
	ApplicationSummary,
	IntakeAdmin,
	IntakePublic,
	MyApplication,
} from "@/lib/enrollment";
import { parseApplicationStatus } from "@/lib/enrollment";
import {
	getApplicationDetail,
	listApplicationsAdmin,
	listIntakesAdmin,
	listMyApplications,
	listOpenIntakes,
} from "@/server/enrollment-db";
import {
	clampId,
	clampPage,
	clampSearchTerm,
	runSafe,
} from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import { getSession } from "@/server/session";

export const listOpenIntakesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<IntakePublic[]> => runSafe(() => listOpenIntakes()),
);

export const listMyApplicationsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<MyApplication[]> => {
		const session = await getSession();
		if (!session) return [];
		return runSafe(() => listMyApplications(Number(session.user.id)));
	},
);

export const listApplicationsAdminFn = createServerFn({ method: "GET" })
	.validator(
		(input?: { status?: ApplicationStatus; search?: string; page?: number }) =>
			input,
	)
	.handler(
		async ({
			data,
		}): Promise<{
			items: ApplicationSummary[];
			total: number;
			page: number;
			totalPages: number;
		}> => {
			await requireAdminSession();
			return runSafe(async () => {
				const result = await listApplicationsAdmin({
					status: parseApplicationStatus(data?.status),
					search: clampSearchTerm(data?.search),
					page: clampPage(data?.page),
				});
				return {
					items: result.items,
					total: result.total,
					page: result.page,
					totalPages: result.totalPages,
				};
			});
		},
	);

export const getApplicationAdminFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => {
		await requireAdminSession();
		return runSafe(() => getApplicationDetail(clampId(data.id)));
	});

export const listIntakesAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<IntakeAdmin[]> => {
		await requireAdminSession();
		return runSafe(() => listIntakesAdmin());
	},
);
