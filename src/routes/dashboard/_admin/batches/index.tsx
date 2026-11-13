import { IconPlus } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { BatchesTable } from '@/components/pages/dashboard/batches/batches-table';
import { Button } from '@/components/ui/button';
import { getAdminBatches } from '@/server/admin/batches';

export const Route = createFileRoute('/dashboard/_admin/batches/')({
	loader: () => getAdminBatches(),
	head: () => ({
		meta: [
			{ title: 'Batches | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const batches = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 pt-0">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Batches</h1>
					<p className="text-muted-foreground text-sm">
						Manage the morning and evening cohorts students apply to.
					</p>
				</div>

				<Button render={<Link to="/dashboard/batches/new" />}>
					<IconPlus stroke={1.75} />
					New batch
				</Button>
			</div>

			<BatchesTable batches={batches} />
		</div>
	);
}
