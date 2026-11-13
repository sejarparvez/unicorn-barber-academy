import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
	ENQUIRY_STATUSES,
	type EnquiryStatus,
} from '@/components/pages/dashboard/enquiries/types';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export type AdminEnquiry = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	interest: string;
	interestLabel: string;
	message: string;
	status: EnquiryStatus;
	note: string | null;
	createdAt: string;
	handledAt: string | null;
	handledByName: string | null;
};

export type EnquiryStats = {
	total: number;
	new: number;
	inProgress: number;
	resolved: number;
	spam: number;
};

export type AdminEnquiries = {
	enquiries: AdminEnquiry[];
	stats: EnquiryStats;
};

export const GENERIC_INTERESTS: Record<string, string> = {
	'not-sure': 'Not sure yet — help me choose',
	general: 'General enquiry',
};

export function interestLabel(
	interest: string,
	programTitles: Map<string, string>,
): string {
	return (
		programTitles.get(interest) ??
		GENERIC_INTERESTS[interest] ??
		interest.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
	);
}

export const getAdminEnquiries = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminEnquiries> => {
		await ensureAdmin();

		const [rows, programs] = await Promise.all([
			db.enquiry.findMany({
				orderBy: { createdAt: 'desc' },
				include: { handledBy: { select: { name: true } } },
			}),
			db.program.findMany({ select: { slug: true, title: true } }),
		]);

		const programTitles = new Map(
			programs.map((program) => [program.slug, program.title]),
		);

		const enquiries: AdminEnquiry[] = rows.map((row) => ({
			id: row.id,
			name: row.name,
			email: row.email,
			phone: row.phone,
			interest: row.interest,
			interestLabel: interestLabel(row.interest, programTitles),
			message: row.message,
			status: row.status,
			note: row.note,
			createdAt: row.createdAt.toISOString(),
			handledAt: row.handledAt ? row.handledAt.toISOString() : null,
			handledByName: row.handledBy?.name ?? null,
		}));

		return {
			enquiries,
			stats: {
				total: enquiries.length,
				new: enquiries.filter((e) => e.status === 'new').length,
				inProgress: enquiries.filter((e) => e.status === 'in_progress').length,
				resolved: enquiries.filter((e) => e.status === 'resolved').length,
				spam: enquiries.filter((e) => e.status === 'spam').length,
			},
		};
	},
);

const statusSchema = z.object({
	id: z.string().trim().min(1),
	status: z.enum(ENQUIRY_STATUSES),
});

export const setEnquiryStatus = createServerFn({ method: 'POST' })
	.validator((input: unknown) => statusSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<{
			id: string;
			status: EnquiryStatus;
			handledAt: string | null;
		}> => {
			const session = await ensureAdmin();
			const isNew = data.status === 'new';

			const enquiry = await db.enquiry.update({
				where: { id: data.id },
				data: {
					status: data.status,
					handledById: isNew ? null : session.user.id,
					handledAt: isNew ? null : new Date(),
				},
				select: { id: true, status: true, handledAt: true },
			});

			return {
				id: enquiry.id,
				status: enquiry.status,
				handledAt: enquiry.handledAt ? enquiry.handledAt.toISOString() : null,
			};
		},
	);

const noteSchema = z.object({
	id: z.string().trim().min(1),
	note: z.string().trim().max(1000, 'Note must be 1,000 characters or fewer.'),
});

export const updateEnquiryNote = createServerFn({ method: 'POST' })
	.validator((input: unknown) => noteSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; note: string | null }> => {
		await ensureAdmin();

		const enquiry = await db.enquiry.update({
			where: { id: data.id },
			data: { note: data.note.length ? data.note : null },
			select: { id: true, note: true },
		});

		return { id: enquiry.id, note: enquiry.note };
	});

const idSchema = z.object({ id: z.string().trim().min(1) });

export const deleteEnquiry = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		return db.enquiry.delete({ where: { id: data.id }, select: { id: true } });
	});
