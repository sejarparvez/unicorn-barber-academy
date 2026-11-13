import { createServerFn } from '@tanstack/react-start';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export type MyEnrollment = {
	id: string;
	status: EnrollmentStatus;
	createdAt: string;
	admissionNo: string | null;
	programTitle: string;
	programSlug: string;
	batchName: string;
	batchSchedule: string;
	batchStartDate: string;
	batchEndDate: string | null;
};

export const getMyEnrollments = createServerFn({ method: 'GET' }).handler(
	async (): Promise<MyEnrollment[]> => {
		const session = await ensureSession();

		const rows = await db.enrollment.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				batch: {
					include: {
						program: { select: { title: true, slug: true } },
					},
				},
			},
		});

		return rows.map((row) => ({
			id: row.id,
			status: row.status,
			createdAt: row.createdAt.toISOString(),
			admissionNo: row.admissionNo,
			programTitle: row.batch.program.title,
			programSlug: row.batch.program.slug,
			batchName: row.batch.name,
			batchSchedule: row.batch.schedule,
			batchStartDate: row.batch.startDate.toISOString(),
			batchEndDate: row.batch.endDate ? row.batch.endDate.toISOString() : null,
		}));
	},
);
