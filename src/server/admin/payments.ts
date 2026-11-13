import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { paymentSchema } from '@/components/pages/dashboard/payments/schemas';
import {
	type PaymentRecord,
	type PaymentTotals,
	paymentTotals,
} from '@/components/pages/payments/types';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import type { Prisma } from '../../../prisma/generated/prisma/client';

const PAYMENT_INCLUDE = {
	enrollment: {
		select: {
			id: true,
			admissionNo: true,
			user: { select: { name: true, email: true } },
			batch: {
				select: { name: true, program: { select: { title: true } } },
			},
		},
	},
	recordedBy: { select: { name: true } },
} as const satisfies Prisma.PaymentInclude;

type PaymentRow = Prisma.PaymentGetPayload<{ include: typeof PAYMENT_INCLUDE }>;

export type AdminPayment = PaymentRecord & {
	enrollmentId: string;
	studentName: string;
	studentEmail: string;
	admissionNo: string | null;
	programTitle: string;
	batchName: string;
	recordedByName: string | null;
};

export type AdminPaymentStats = {
	collected: number;
	outstanding: number;
	paymentCount: number;
	enrolledStudents: number;
};

export type AdminPayments = {
	payments: AdminPayment[];
	stats: AdminPaymentStats;
};

function toAdminPayment(row: PaymentRow): AdminPayment {
	return {
		id: row.id,
		amount: row.amount,
		method: row.method,
		reference: row.reference,
		note: row.note,
		paidAt: row.paidAt.toISOString(),
		createdAt: row.createdAt.toISOString(),
		enrollmentId: row.enrollmentId,
		studentName: row.enrollment.user.name,
		studentEmail: row.enrollment.user.email,
		admissionNo: row.enrollment.admissionNo,
		programTitle: row.enrollment.batch.program.title,
		batchName: row.enrollment.batch.name,
		recordedByName: row.recordedBy?.name ?? null,
	};
}

export const getAdminPayments = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminPayments> => {
		await ensureAdmin();

		const [rows, activeEnrollments] = await Promise.all([
			db.payment.findMany({
				orderBy: [{ paidAt: 'desc' }, { createdAt: 'desc' }],
				include: PAYMENT_INCLUDE,
			}),
			db.enrollment.findMany({
				where: { status: 'active' },
				select: {
					id: true,
					batch: { select: { program: { select: { price: true } } } },
					payments: { select: { amount: true } },
				},
			}),
		]);

		const payments = rows.map(toAdminPayment);

		const outstanding = activeEnrollments.reduce((sum, enrollment) => {
			const paid = enrollment.payments.reduce(
				(total, payment) => total + payment.amount,
				0,
			);
			return sum + Math.max(enrollment.batch.program.price - paid, 0);
		}, 0);

		return {
			payments,
			stats: {
				collected: payments.reduce((sum, payment) => sum + payment.amount, 0),
				outstanding,
				paymentCount: payments.length,
				enrolledStudents: activeEnrollments.length,
			},
		};
	},
);

export type PaymentEnrollmentOption = PaymentTotals & {
	id: string;
	label: string;
	studentName: string;
	programTitle: string;
	batchName: string;
};

/** Enrolments an admin can record a payment against. */
export const getPaymentFormOptions = createServerFn({ method: 'GET' }).handler(
	async (): Promise<PaymentEnrollmentOption[]> => {
		await ensureAdmin();

		const rows = await db.enrollment.findMany({
			where: { status: { in: ['active', 'completed'] } },
			orderBy: [{ user: { name: 'asc' } }],
			select: {
				id: true,
				user: { select: { name: true } },
				batch: {
					select: {
						name: true,
						program: { select: { title: true, price: true } },
					},
				},
				payments: { select: { amount: true } },
			},
		});

		return rows.map((row) => {
			const totals = paymentTotals(row.batch.program.price, row.payments);
			const programTitle = row.batch.program.title;
			const batchName = row.batch.name;

			return {
				id: row.id,
				label: `${row.user.name} — ${programTitle} (${batchName})`,
				studentName: row.user.name,
				programTitle,
				batchName,
				...totals,
			};
		});
	},
);

const idSchema = z.object({ id: z.string().trim().min(1) });

export type EnrollmentPayments = PaymentTotals & {
	enrollmentId: string;
	admissionNo: string | null;
	studentName: string;
	programTitle: string;
	batchName: string;
	payments: AdminPayment[];
};

/** Payment history for one enrolment, used on the application detail page. */
export const getEnrollmentPayments = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<EnrollmentPayments | null> => {
		await ensureAdmin();

		const row = await db.enrollment.findUnique({
			where: { id: data.id },
			select: {
				id: true,
				admissionNo: true,
				user: { select: { name: true, email: true } },
				batch: {
					select: {
						name: true,
						program: { select: { title: true, price: true } },
					},
				},
				payments: {
					orderBy: { paidAt: 'desc' },
					include: { recordedBy: { select: { name: true } } },
				},
			},
		});

		if (!row) {
			return null;
		}

		const totals = paymentTotals(row.batch.program.price, row.payments);

		const payments: AdminPayment[] = row.payments.map((payment) => ({
			id: payment.id,
			amount: payment.amount,
			method: payment.method,
			reference: payment.reference,
			note: payment.note,
			paidAt: payment.paidAt.toISOString(),
			createdAt: payment.createdAt.toISOString(),
			enrollmentId: row.id,
			studentName: row.user.name,
			studentEmail: row.user.email,
			admissionNo: row.admissionNo,
			programTitle: row.batch.program.title,
			batchName: row.batch.name,
			recordedByName: payment.recordedBy?.name ?? null,
		}));

		return {
			enrollmentId: row.id,
			admissionNo: row.admissionNo,
			studentName: row.user.name,
			programTitle: row.batch.program.title,
			batchName: row.batch.name,
			...totals,
			payments,
		};
	});

export const recordPayment = createServerFn({ method: 'POST' })
	.validator((input: unknown) => paymentSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		const session = await ensureAdmin();

		const enrollment = await db.enrollment.findUnique({
			where: { id: data.enrollmentId },
			select: { id: true },
		});

		if (!enrollment) {
			throw new Error('That student enrolment no longer exists.');
		}

		const payment = await db.payment.create({
			data: {
				enrollmentId: data.enrollmentId,
				amount: data.amount,
				method: data.method,
				reference: data.reference.length ? data.reference : null,
				note: data.note.length ? data.note : null,
				paidAt: new Date(`${data.paidAt}T00:00:00.000Z`),
				recordedById: session.user.id,
			},
			select: { id: true },
		});

		return { id: payment.id };
	});

export const deletePayment = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		return db.payment.delete({ where: { id: data.id }, select: { id: true } });
	});
