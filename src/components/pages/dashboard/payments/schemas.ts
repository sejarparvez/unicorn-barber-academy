import { z } from 'zod';
import { PAYMENT_METHODS } from '@/components/pages/payments/types';

export const paymentSchema = z.object({
	enrollmentId: z.string().trim().min(1, 'Choose a student.'),
	amount: z
		.number()
		.int('Amount must be a whole number.')
		.min(1, 'Amount must be at least ৳1.')
		.max(10_000_000, 'Amount looks too large.'),
	method: z.enum(PAYMENT_METHODS, { message: 'Choose a payment method.' }),
	reference: z
		.string()
		.trim()
		.max(120, 'Reference must be 120 characters or fewer.'),
	note: z.string().trim().max(500, 'Note must be 500 characters or fewer.'),
	paidAt: z.string().trim().min(1, 'Choose the payment date.'),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
