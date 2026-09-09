// src/server/inquiry-fns.ts
// Admin-only reads + triage mutations for the contact inbox.
import { createServerFn } from "@tanstack/react-start";
import type { InquiryListResult } from "@/lib/inquiry";
import { clampId, clampPage, runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import {
	deleteInquiry,
	listInquiriesAdmin,
	markInquiry,
} from "@/server/inquiry/inquiry-db";

export const listInquiriesFn = createServerFn({ method: "GET" })
	.validator((input?: { unreadOnly?: boolean; page?: number }) => input)
	.handler(async ({ data }): Promise<InquiryListResult> => {
		await requireAdminSession();
		return runSafe(() =>
			listInquiriesAdmin({
				unreadOnly: data?.unreadOnly === true,
				page: clampPage(data?.page),
			}),
		);
	});

export const markInquiryFn = createServerFn({ method: "POST" })
	.validator(
		(input: { id: number; patch: { isRead?: boolean; isReplied?: boolean } }) =>
			input,
	)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const updated = await runSafe(() =>
			markInquiry(id, {
				...(data.patch.isRead !== undefined
					? { isRead: data.patch.isRead === true }
					: {}),
				...(data.patch.isReplied !== undefined
					? { isReplied: data.patch.isReplied === true }
					: {}),
			}),
		);
		if (!updated) throw new Error("Not found");
		return { ok: true };
	});

export const deleteInquiryFn = createServerFn({ method: "POST" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<{ ok: true }> => {
		await requireAdminSession();
		const id = clampId(data.id);
		if (!id) throw new Error("Invalid id");
		const deleted = await runSafe(() => deleteInquiry(id));
		if (!deleted) throw new Error("Not found");
		return { ok: true };
	});
