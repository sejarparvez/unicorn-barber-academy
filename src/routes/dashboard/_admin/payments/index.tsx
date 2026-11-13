import { IconPlus } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PaymentsSummary } from '@/components/pages/dashboard/payments/payments-summary';
import { PaymentsTable } from '@/components/pages/dashboard/payments/payments-table';
import { Button } from '@/components/ui/button';
import { getAdminPayments } from '@/server/admin/payments';

export const Route = createFileRoute('/dashboard/_admin/payments/')({
	loader: () => getAdminPayments(),
	head: () => ({
		meta: [
			{ title: 'Payments | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { payments, stats } = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 pt-0">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Payments</h1>
					<p className="text-muted-foreground text-sm">
						Fees collected from students, recorded manually as they come in.
					</p>
				</div>

				<Button render={<Link to="/dashboard/payments/new" />}>
					<IconPlus stroke={1.75} />
					Record payment
				</Button>
			</div>

			<PaymentsSummary stats={stats} />

			<PaymentsTable payments={payments} />
		</div>
	);
}
