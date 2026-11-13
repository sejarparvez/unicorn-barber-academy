import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
	type BatchFormValues,
	batchSchema,
} from '@/components/pages/dashboard/batches/schemas';
import type { BatchStatus } from '@/components/pages/programs/types';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import type { Prisma } from '../../../prisma/generated/prisma/client';

const BATCH_INCLUDE = {
	_count: { select: { enrollments: { where: { status: 'active' } } } },
	program: { select: { title: true, position: true } },
} as const satisfies Prisma.BatchInclude;

type BatchRow = Prisma.BatchGetPayload<{ include: typeof BATCH_INCLUDE }>;

export type AdminBatchSummary = {
	id: string;
	programId: string;
	programTitle: string;
	name: string;
	startDate: string;
	endDate: string | null;
	schedule: string;
	capacity: number;
	seatsTaken: number;
	status: BatchStatus;
	hidden: boolean;
};

export type AdminBatchDetail = Omit<BatchFormValues, 'endDate'> & {
	id: string;
	endDate: string | null;
};

const idSchema = z.object({ id: z.string().trim().min(1) });

function toSummary(row: BatchRow): AdminBatchSummary {
	return {
		id: row.id,
		programId: row.programId,
		programTitle: row.program.title,
		name: row.name,
		startDate: row.startDate.toISOString(),
		endDate: row.endDate ? row.endDate.toISOString() : null,
		schedule: row.schedule,
		capacity: row.capacity,
		seatsTaken: row._count.enrollments,
		status: row.status,
		hidden: row.hidden,
	};
}

function parseDate(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

export const getAdminBatches = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminBatchSummary[]> => {
		await ensureAdmin();

		const rows = await db.batch.findMany({
			orderBy: [
				{ program: { position: 'asc' } },
				{ startDate: 'asc' },
				{ createdAt: 'asc' },
			],
			include: BATCH_INCLUDE,
		});

		return rows.map(toSummary);
	},
);

export const getAdminBatch = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<AdminBatchDetail | null> => {
		await ensureAdmin();

		const row = await db.batch.findUnique({ where: { id: data.id } });

		if (!row) {
			return null;
		}

		return {
			id: row.id,
			programId: row.programId,
			name: row.name,
			startDate: row.startDate.toISOString(),
			endDate: row.endDate ? row.endDate.toISOString() : null,
			schedule: row.schedule,
			capacity: row.capacity,
			status: row.status,
			hidden: row.hidden,
		};
	});

export const createBatch = createServerFn({ method: 'POST' })
	.validator((input: unknown) => batchSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		const batch = await db.batch.create({
			data: {
				programId: data.programId,
				name: data.name,
				startDate: parseDate(data.startDate),
				endDate: data.endDate ? parseDate(data.endDate) : null,
				schedule: data.schedule,
				capacity: data.capacity,
				status: data.status,
				hidden: data.hidden,
			},
			select: { id: true },
		});

		return { id: batch.id };
	});

const updateSchema = batchSchema.and(idSchema);

export const updateBatch = createServerFn({ method: 'POST' })
	.validator((input: unknown) => updateSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		const batch = await db.batch.update({
			where: { id: data.id },
			data: {
				programId: data.programId,
				name: data.name,
				startDate: parseDate(data.startDate),
				endDate: data.endDate ? parseDate(data.endDate) : null,
				schedule: data.schedule,
				capacity: data.capacity,
				status: data.status,
				hidden: data.hidden,
			},
			select: { id: true },
		});

		return { id: batch.id };
	});

const hiddenSchema = z.object({
	id: z.string().trim().min(1),
	hidden: z.boolean(),
});

export const setBatchHidden = createServerFn({ method: 'POST' })
	.validator((input: unknown) => hiddenSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; hidden: boolean }> => {
		await ensureAdmin();

		return db.batch.update({
			where: { id: data.id },
			data: { hidden: data.hidden },
			select: { id: true, hidden: true },
		});
	});

export const deleteBatch = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		return db.batch.delete({ where: { id: data.id }, select: { id: true } });
	});
