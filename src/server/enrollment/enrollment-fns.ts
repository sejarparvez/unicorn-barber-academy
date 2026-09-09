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
	Cohort,
	FeeStatus,
	IntakeAdmin,
	IntakePublic,
	MyApplication,
	ProgramAdmin,
	ProgramOption,
} from "@/lib/enrollment";
import {
	parseApplicationStatus,
	parseCohort,
	parseFeeStatus,
} from "@/lib/enrollment";
import { logAdminAction } from "@/server/audit/audit-log";
import {
	deleteFeePayment,
	getApplicationDetail,
	listApplicationStatusLog,
	listApplicationsAdmin,
	listIntakesAdmin,
	listMyApplications,
	listOpenIntakes,
	recordFeePayment,
} from "@/server/enrollment/enrollment-db";
import {
	parseFeePaymentPayload,
	parseProgramPatch,
} from "@/server/enrollment/enrollment-validate";
import {
	clampId,
	clampPage,
	clampSearchTerm,
	runSafe,
} from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import {
	listProgramOptions,
	listProgramsAdmin,
	updateProgram,
} from "@/server/program/program-db";
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
		(input?: {
			status?: ApplicationStatus;
			search?: string;
			programSlug?: string;
			cohort?: Cohort;
			feeStatus?: FeeStatus;
			page?: number;
		}) => input,
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
					programSlug: clampSearchTerm(data?.programSlug, 50),
					cohort: parseCohort(data?.cohort),
					feeStatus: parseFeeStatus(data?.feeStatus),
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

export const listApplicationStatusLogFn = createServerFn({ method: "GET" })
	.validator((input: { applicationId: number }) => input)
	.handler(async ({ data }) => {
		await requireAdminSession();
		return runSafe(() => listApplicationStatusLog(clampId(data.applicationId)));
	});

export const listIntakesAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<IntakeAdmin[]> => {
		await requireAdminSession();
		return runSafe(() => listIntakesAdmin());
	},
);

export const listProgramOptionsFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ProgramOption[]> => {
		await requireAdminSession();
		return runSafe(() => listProgramOptions());
	},
);

export const listProgramsAdminFn = createServerFn({ method: "GET" }).handler(
	async (): Promise<ProgramAdmin[]> => {
		await requireAdminSession();
		return runSafe(() => listProgramsAdmin());
	},
);

export const updateProgramFn = createServerFn({ method: "POST" })
	.validator((input: { slug: string; patch: Record<string, unknown> }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const parsed = parseProgramPatch(data.patch);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() => updateProgram(data.slug, parsed.value));
		if (!result.ok) throw new Error("Program not found");
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "program.update",
			targetType: "program",
			targetId: data.slug,
			summary: `Updated program ${data.slug}: ${Object.keys(parsed.value).join(", ")}`,
			metadata: { patch: parsed.value },
		});
		return { ok: true };
	});

export const recordFeePaymentFn = createServerFn({ method: "POST" })
	.validator(
		(input: { applicationId: number; payment: Record<string, unknown> }) =>
			input,
	)
	.handler(async ({ data }): Promise<{ id: number }> => {
		const session = await requireAdminSession();
		const applicationId = clampId(data.applicationId);
		if (!applicationId) throw new Error("Invalid application id");
		const parsed = parseFeePaymentPayload(data.payment);
		if (!parsed.ok) throw new Error(parsed.message);
		const result = await runSafe(() =>
			recordFeePayment({
				applicationId,
				amountPoisha: parsed.value.amountPoisha,
				method: parsed.value.method,
				receiptRef: parsed.value.receiptRef,
				receivedBy: Number(session.user.id),
				paidAt: parsed.value.paidAt,
			}),
		);
		if (!result.ok) {
			throw new Error(
				result.reason === "not-found"
					? "Application not found"
					: "Invalid payment",
			);
		}
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "application.fee",
			targetType: "application",
			targetId: applicationId,
			summary: `Recorded ৳${(parsed.value.amountPoisha / 100).toLocaleString("en-US")} (${parsed.value.method}) for application #${applicationId}`,
			metadata: {
				amountPoisha: parsed.value.amountPoisha,
				method: parsed.value.method,
			},
		});
		return { id: result.id ?? 0 };
	});

export const deleteFeePaymentFn = createServerFn({ method: "POST" })
	.validator((input: { applicationId: number; paymentId: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		const session = await requireAdminSession();
		const applicationId = clampId(data.applicationId);
		const paymentId = clampId(data.paymentId);
		if (!applicationId || !paymentId) throw new Error("Invalid id");
		const deleted = await runSafe(() =>
			deleteFeePayment(applicationId, paymentId),
		);
		if (!deleted) throw new Error("Payment not found");
		await logAdminAction({
			actorId: Number(session.user.id),
			action: "application.fee",
			targetType: "application",
			targetId: applicationId,
			summary: `Voided payment #${paymentId} on application #${applicationId}`,
			metadata: { voidedPaymentId: paymentId },
		});
		return { ok: true };
	});
