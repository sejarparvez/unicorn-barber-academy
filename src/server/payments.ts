import { createServerFn } from '@tanstack/react-start';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import {
	type PaymentRecord,
	type PaymentTotals,
	paymentTotals,
} from '@/components/pages/payments/types';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export type MyPaymentEnrollment = PaymentTotals & {
	id: string;
	status: EnrollmentStatus;
	admissionNo: string | null;
	programTitle: string;
	programSlug: string;
	batchName: string;
	payments: PaymentRecord[];
};

export type MyPayments = {
	enrollments: MyPaymentEnrollment[];
	totalDue: number;
	totalPaid: number;
	balance: number;
};

export const getMyPayments = createServerFn({ method: 'GET' }).handler(
	async (): Promise<MyPayments> => {
		const session = await ensureSession();

		const rows = await db.enrollment.findMany({
			where: { userId: session.user.id },
			orderBy: { createdAt: 'desc' },
			include: {
				batch: {
					include: {
						program: { select: { title: true, slug: true, price: true } },
					},
				},
				payments: { orderBy: { paidAt: 'desc' } },
			},
		});

		// Only show programs the student is (or has been) enrolled in, or where a
		// payment exists — pending applications would just show a confusing balance.
		const relevant = rows.filter(
			(row) =>
				row.payments.length > 0 ||
				row.status === 'active' ||
				row.status === 'completed',
		);

		const enrollments = relevant.map((row) => {
			const totals = paymentTotals(row.batch.program.price, row.payments);

			return {
				id: row.id,
				status: row.status,
				admissionNo: row.admissionNo,
				programTitle: row.batch.program.title,
				programSlug: row.batch.program.slug,
				batchName: row.batch.name,
				...totals,
				payments: row.payments.map((payment) => ({
					id: payment.id,
					amount: payment.amount,
					method: payment.method,
					reference: payment.reference,
					note: payment.note,
					paidAt: payment.paidAt.toISOString(),
					createdAt: payment.createdAt.toISOString(),
				})),
			};
		});

		return {
			enrollments,
			totalDue: enrollments.reduce((sum, item) => sum + item.totalDue, 0),
			totalPaid: enrollments.reduce((sum, item) => sum + item.totalPaid, 0),
			balance: enrollments.reduce((sum, item) => sum + item.balance, 0),
		};
	},
);
