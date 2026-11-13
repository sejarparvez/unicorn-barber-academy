import { createFileRoute } from '@tanstack/react-router';
import { MyPaymentsList } from '@/components/pages/dashboard/my-payments/my-payments-list';
import { getMyPayments } from '@/server/payments';

export const Route = createFileRoute('/dashboard/my-payments')({
	loader: () => getMyPayments(),
	head: () => ({
		meta: [
			{ title: 'My payments | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const data = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">My payments</h1>
				<p className="text-muted-foreground text-sm">
					Fees recorded against your admissions. Payments are entered by the
					academy office.
				</p>
			</div>

			<MyPaymentsList data={data} />
		</div>
	);
}
