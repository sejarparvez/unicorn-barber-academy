export type PaymentMethod =
	| 'cash'
	| 'bkash'
	| 'nagad'
	| 'bank'
	| 'card'
	| 'other';

export const PAYMENT_METHODS = [
	'cash',
	'bkash',
	'nagad',
	'bank',
	'card',
	'other',
] as const satisfies readonly PaymentMethod[];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
	cash: 'Cash',
	bkash: 'bKash',
	nagad: 'Nagad',
	bank: 'Bank transfer',
	card: 'Card',
	other: 'Other',
};

/** A single recorded payment, shared by the student and admin views. */
export type PaymentRecord = {
	id: string;
	amount: number;
	method: PaymentMethod;
	reference: string | null;
	note: string | null;
	paidAt: string;
	createdAt: string;
};

export type PaymentTotals = {
	totalDue: number;
	totalPaid: number;
	balance: number;
	isPaidOff: boolean;
};

/** Adds up a due amount against the payments made so far. */
export function paymentTotals(
	totalDue: number,
	payments: { amount: number }[],
): PaymentTotals {
	const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
	const balance = Math.max(totalDue - totalPaid, 0);

	return {
		totalDue,
		totalPaid,
		balance,
		isPaidOff: totalPaid >= totalDue,
	};
}

export function formatPaymentDate(value: string) {
	return new Date(value).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}
