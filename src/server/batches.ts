import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { admissionFormSchema } from '@/components/pages/enroll/schemas';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import type { ProgramBatch } from '@/components/pages/programs/types';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import type { Prisma } from '../../prisma/generated/prisma/client';

/** Batches students can still apply to. */
const OPEN_STATUSES = ['upcoming', 'running'] as const;

const BATCH_INCLUDE = {
	_count: { select: { enrollments: { where: { status: 'active' } } } },
} as const satisfies Prisma.BatchInclude;

type BatchRow = Prisma.BatchGetPayload<{ include: typeof BATCH_INCLUDE }>;

function toProgramBatch(row: BatchRow): ProgramBatch {
	const seatsTaken = row._count.enrollments;
	const seatsRemaining = Math.max(row.capacity - seatsTaken, 0);

	return {
		id: row.id,
		name: row.name,
		startDate: row.startDate.toISOString(),
		endDate: row.endDate ? row.endDate.toISOString() : null,
		schedule: row.schedule,
		capacity: row.capacity,
		seatsTaken,
		seatsRemaining,
		isFull: seatsTaken >= row.capacity,
		status: row.status,
	};
}

const slugSchema = z.object({ slug: z.string().trim().min(1) });

export const getProgramBatches = createServerFn({ method: 'GET' })
	.validator((input: unknown) => slugSchema.parse(input))
	.handler(async ({ data }): Promise<ProgramBatch[]> => {
		const program = await db.program.findFirst({
			where: { slug: data.slug, hidden: false },
			select: { id: true },
		});

		if (!program) {
			return [];
		}

		const batches = await db.batch.findMany({
			where: {
				programId: program.id,
				hidden: false,
				status: { in: [...OPEN_STATUSES] },
			},
			orderBy: { startDate: 'asc' },
			include: BATCH_INCLUDE,
		});

		return batches.map(toProgramBatch);
	});

export type EnrollmentTarget = {
	batch: ProgramBatch;
	program: { slug: string; title: string; price: number };
	existingStatus: EnrollmentStatus | null;
	/** Prefill for the admission form, taken from the signed-in account. */
	defaults: { fullName: string; whatsapp: string };
};

export type EnrollmentOption = {
	programSlug: string;
	programTitle: string;
	batches: ProgramBatch[];
};

export const getEnrollmentOptions = createServerFn({ method: 'GET' }).handler(
	async (): Promise<EnrollmentOption[]> => {
		const programs = await db.program.findMany({
			where: {
				hidden: false,
				batches: {
					some: { hidden: false, status: { in: [...OPEN_STATUSES] } },
				},
			},
			orderBy: { position: 'asc' },
			select: {
				slug: true,
				title: true,
				batches: {
					where: { hidden: false, status: { in: [...OPEN_STATUSES] } },
					orderBy: { startDate: 'asc' },
					include: BATCH_INCLUDE,
				},
			},
		});

		return programs.map((program) => ({
			programSlug: program.slug,
			programTitle: program.title,
			batches: program.batches.map(toProgramBatch),
		}));
	},
);

const batchIdSchema = z.object({ batchId: z.string().trim().min(1) });

export const getEnrollmentTarget = createServerFn({ method: 'GET' })
	.validator((input: unknown) => batchIdSchema.parse(input))
	.handler(async ({ data }): Promise<EnrollmentTarget | null> => {
		const session = await ensureSession();

		const batch = await db.batch.findFirst({
			where: { id: data.batchId, hidden: false },
			include: {
				...BATCH_INCLUDE,
				program: {
					select: { slug: true, title: true, price: true, hidden: true },
				},
			},
		});

		if (!batch || batch.program.hidden) {
			return null;
		}

		const existing = await db.enrollment.findUnique({
			where: {
				userId_batchId: { userId: session.user.id, batchId: batch.id },
			},
			select: { status: true },
		});

		return {
			batch: toProgramBatch(batch),
			program: {
				slug: batch.program.slug,
				title: batch.program.title,
				price: batch.program.price,
			},
			existingStatus: existing?.status ?? null,
			defaults: {
				fullName: session.user.name,
				whatsapp: session.user.email,
			},
		};
	});

const applySchema = z
	.object({ batchId: z.string().trim().min(1) })
	.and(admissionFormSchema);

export const applyToBatch = createServerFn({ method: 'POST' })
	.validator((input: unknown) => applySchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		const session = await ensureSession();

		const batch = await db.batch.findFirst({
			where: {
				id: data.batchId,
				hidden: false,
				status: { in: [...OPEN_STATUSES] },
			},
			include: BATCH_INCLUDE,
		});

		if (!batch) {
			throw new Error('This batch is no longer accepting applications.');
		}

		if (batch._count.enrollments >= batch.capacity) {
			throw new Error('This batch is full. Please choose another batch.');
		}

		const existing = await db.enrollment.findUnique({
			where: {
				userId_batchId: { userId: session.user.id, batchId: batch.id },
			},
			select: { id: true },
		});

		if (existing) {
			throw new Error('You have already applied to this batch.');
		}

		const enrollment = await db.enrollment.create({
			data: {
				userId: session.user.id,
				batchId: batch.id,
				status: 'applied',
				fullName: data.fullName,
				fatherName: data.fatherName,
				motherName: data.motherName,
				dateOfBirth: new Date(data.dateOfBirth),
				nationality: data.nationality,
				gender: data.gender,
				nidNumber: data.nidNumber,
				phone: data.phone,
				whatsapp: data.whatsapp?.length ? data.whatsapp : null,
				presentAddress: data.presentAddress,
				permanentAddress: data.permanentAddress,
				emergencyName: data.emergencyName,
				emergencyRelation: data.emergencyRelation,
				emergencyMobile: data.emergencyMobile,
				emergencyAddress: data.emergencyAddress?.length
					? data.emergencyAddress
					: null,
				education: data.education,
				hasBarberingExperience: data.hasBarberingExperience,
				barberingExperienceDuration:
					data.hasBarberingExperience &&
					data.barberingExperienceDuration?.length
						? data.barberingExperienceDuration
						: null,
				hasPreviousTraining: data.hasPreviousTraining,
				previousTrainingInstitution:
					data.hasPreviousTraining && data.previousTrainingInstitution?.length
						? data.previousTrainingInstitution
						: null,
				goal: data.goal,
			},
			select: { id: true },
		});

		return { id: enrollment.id };
	});
