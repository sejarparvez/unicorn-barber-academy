import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import type { Prisma } from '../../../prisma/generated/prisma/client';

export const ENROLLMENT_STATUSES = [
	'applied',
	'waitlisted',
	'rejected',
	'active',
	'completed',
	'withdrawn',
] as const;

const APPLICATION_INCLUDE = {
	user: { select: { name: true, email: true } },
	batch: {
		include: {
			program: { select: { title: true, slug: true } },
		},
	},
} as const satisfies Prisma.EnrollmentInclude;

type ApplicationRow = Prisma.EnrollmentGetPayload<{
	include: typeof APPLICATION_INCLUDE;
}>;

/** The full admission form, as captured from the student. */
export type AdminApplication = {
	id: string;
	status: EnrollmentStatus;
	createdAt: string;
	decidedAt: string | null;
	admissionNo: string | null;
	admittedAt: string | null;
	studentName: string;
	studentEmail: string;
	// 1. Student information
	fullName: string;
	fatherName: string;
	motherName: string;
	dateOfBirth: string;
	nationality: string;
	gender: string;
	nidNumber: string;
	// 2. Contact information
	phone: string;
	whatsapp: string | null;
	presentAddress: string;
	permanentAddress: string;
	// 3. Emergency contact
	emergencyName: string;
	emergencyRelation: string;
	emergencyMobile: string;
	emergencyAddress: string | null;
	// 4. Education & previous experience
	education: string;
	hasBarberingExperience: boolean;
	barberingExperienceDuration: string | null;
	hasPreviousTraining: boolean;
	previousTrainingInstitution: string | null;
	goal: string;
	// Program & batch
	programTitle: string;
	programSlug: string;
	batchName: string;
	batchStartDate: string;
	batchSchedule: string;
};

function toApplication(row: ApplicationRow): AdminApplication {
	return {
		id: row.id,
		status: row.status,
		createdAt: row.createdAt.toISOString(),
		decidedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
		admissionNo: row.admissionNo,
		admittedAt: row.admittedAt ? row.admittedAt.toISOString() : null,
		studentName: row.user.name,
		studentEmail: row.user.email,
		fullName: row.fullName,
		fatherName: row.fatherName,
		motherName: row.motherName,
		dateOfBirth: row.dateOfBirth.toISOString(),
		nationality: row.nationality,
		gender: row.gender,
		nidNumber: row.nidNumber,
		phone: row.phone,
		whatsapp: row.whatsapp,
		presentAddress: row.presentAddress,
		permanentAddress: row.permanentAddress,
		emergencyName: row.emergencyName,
		emergencyRelation: row.emergencyRelation,
		emergencyMobile: row.emergencyMobile,
		emergencyAddress: row.emergencyAddress,
		education: row.education,
		hasBarberingExperience: row.hasBarberingExperience,
		barberingExperienceDuration: row.barberingExperienceDuration,
		hasPreviousTraining: row.hasPreviousTraining,
		previousTrainingInstitution: row.previousTrainingInstitution,
		goal: row.goal,
		programTitle: row.batch.program.title,
		programSlug: row.batch.program.slug,
		batchName: row.batch.name,
		batchStartDate: row.batch.startDate.toISOString(),
		batchSchedule: row.batch.schedule,
	};
}

export const getAdminApplications = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminApplication[]> => {
		await ensureAdmin();

		const rows = await db.enrollment.findMany({
			orderBy: { createdAt: 'desc' },
			include: APPLICATION_INCLUDE,
		});

		return rows.map(toApplication);
	},
);

const idSchema = z.object({ id: z.string().trim().min(1) });

export const getAdminApplication = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<AdminApplication | null> => {
		await ensureAdmin();

		const row = await db.enrollment.findUnique({
			where: { id: data.id },
			include: APPLICATION_INCLUDE,
		});

		return row ? toApplication(row) : null;
	});

/** Admission numbers look like `UBTA-2026-0001`, unique per year. */
async function generateAdmissionNo() {
	const year = new Date().getFullYear();
	const prefix = `UBTA-${year}-`;
	const last = await db.enrollment.findFirst({
		where: { admissionNo: { startsWith: prefix } },
		orderBy: { admissionNo: 'desc' },
		select: { admissionNo: true },
	});

	const next = last?.admissionNo
		? Number.parseInt(last.admissionNo.slice(prefix.length), 10) + 1
		: 1;

	return `${prefix}${String(next).padStart(4, '0')}`;
}

const setStatusSchema = z.object({
	id: z.string().trim().min(1),
	status: z.enum(ENROLLMENT_STATUSES),
});

export const setEnrollmentStatus = createServerFn({ method: 'POST' })
	.validator((input: unknown) => setStatusSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<{
			id: string;
			status: EnrollmentStatus;
			admissionNo: string | null;
		}> => {
			const session = await ensureAdmin();

			const enrollment = await db.enrollment.findUnique({
				where: { id: data.id },
				select: { id: true, batchId: true, admissionNo: true },
			});

			if (!enrollment) {
				throw new Error('Application not found.');
			}

			if (data.status === 'active') {
				const [batch, activeCount] = await Promise.all([
					db.batch.findUnique({
						where: { id: enrollment.batchId },
						select: { capacity: true },
					}),
					db.enrollment.count({
						where: {
							batchId: enrollment.batchId,
							status: 'active',
							id: { not: enrollment.id },
						},
					}),
				]);

				if (batch && activeCount >= batch.capacity) {
					throw new Error('This batch is already full.');
				}
			}

			// Assign an admission number the first time an application is approved.
			const assignAdmission =
				data.status === 'active' && !enrollment.admissionNo;
			const admissionNo = assignAdmission
				? await generateAdmissionNo()
				: enrollment.admissionNo;

			await db.enrollment.update({
				where: { id: data.id },
				data: {
					status: data.status,
					decidedAt: new Date(),
					decidedById: session.user.id,
					admissionNo,
					...(assignAdmission ? { admittedAt: new Date() } : {}),
				},
			});

			return { id: data.id, status: data.status, admissionNo };
		},
	);

export type AdminStudent = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	createdAt: string;
	enrollmentCount: number;
	activePrograms: string[];
};

export const getAdminStudents = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminStudent[]> => {
		await ensureAdmin();

		const rows = await db.user.findMany({
			where: { role: { not: 'admin' } },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				createdAt: true,
				enrollments: {
					select: {
						status: true,
						batch: {
							select: { program: { select: { title: true } } },
						},
					},
				},
			},
		});

		return rows.map((row) => {
			const activePrograms = [
				...new Set(
					row.enrollments
						.filter((enrollment) => enrollment.status === 'active')
						.map((enrollment) => enrollment.batch.program.title),
				),
			];

			return {
				id: row.id,
				name: row.name,
				email: row.email,
				image: row.image,
				createdAt: row.createdAt.toISOString(),
				enrollmentCount: row.enrollments.length,
				activePrograms,
			};
		});
	},
);
