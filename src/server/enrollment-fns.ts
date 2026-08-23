// src/server/enrollment-fns.ts
// Server-function wrappers around enrollment-db for TanStack Router loaders
// (same pattern as blog-fns.ts — client-side navigations must re-run these
// on the server).
import { createServerFn } from "@tanstack/react-start";
import type {
	ApplicationStatus,
	ApplicationSummary,
	IntakeAdmin,
	IntakePublic,
	MyApplication,
} from "@/lib/enrollment";
import {
	getApplicationDetail,
	listApplicationsAdmin,
	listIntakesAdmin,
	listMyApplications,
	listOpenIntakes,
} from "@/server/enrollment-db";
import { getSession } from "@/server/session";

export const listOpenIntakesFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<IntakePublic[]> => listOpenIntakes(),
);

export const listMyApplicationsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<MyApplication[]> => {
		const session = await getSession();
		if (!session) return [];
		return listMyApplications(Number(session.user.id));
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
			const result = await listApplicationsAdmin({
				status: data?.status,
				search: data?.search,
				page: data?.page ?? 1,
			});
			return {
				items: result.items,
				total: result.total,
				page: result.page,
				totalPages: result.totalPages,
			};
		},
	);

export const getApplicationAdminFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }) => getApplicationDetail(data.id));

export const listIntakesAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<IntakeAdmin[]> => listIntakesAdmin(),
);
