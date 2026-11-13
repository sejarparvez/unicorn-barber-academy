import { createFileRoute } from '@tanstack/react-router';
import { PaymentForm } from '@/components/pages/dashboard/payments/payment-form';
import { getPaymentFormOptions } from '@/server/admin/payments';

export const Route = createFileRoute('/dashboard/_admin/payments/new')({
	validateSearch: (
		search: Record<string, unknown>,
	): { enrollmentId?: string } => ({
		enrollmentId:
			typeof search.enrollmentId === 'string' ? search.enrollmentId : undefined,
	}),
	loader: () => getPaymentFormOptions(),
	head: () => ({
		meta: [
			{ title: 'Record payment | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const options = Route.useLoaderData();
	const { enrollmentId } = Route.useSearch();

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Record payment
				</h1>
				<p className="text-muted-foreground text-sm">
					Log a fee payment against a student&apos;s admission.
				</p>
			</div>

			<PaymentForm options={options} preselectedEnrollmentId={enrollmentId} />
		</div>
	);
}
