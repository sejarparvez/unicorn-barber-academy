import { createFileRoute, notFound } from '@tanstack/react-router';
import { BatchForm } from '@/components/pages/dashboard/batches/batch-form';
import { toDateInput } from '@/components/pages/dashboard/batches/schemas';
import { getAdminBatch } from '@/server/admin/batches';
import { getAdminPrograms } from '@/server/admin/programs';

export const Route = createFileRoute('/dashboard/_admin/batches/$batchId/edit')(
	{
		loader: async ({ params }) => {
			const [batch, programs] = await Promise.all([
				getAdminBatch({ data: { id: params.batchId } }),
				getAdminPrograms(),
			]);

			if (!batch) {
				throw notFound();
			}

			return { batch, programs };
		},
		head: () => ({
			meta: [
				{ title: 'Edit batch | Unicorn Barber Training Academy' },
				{ name: 'robots', content: 'noindex' },
			],
		}),
		component: RouteComponent,
	},
);

function RouteComponent() {
	const { batch, programs } = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Edit {batch.name} batch
				</h1>
				<p className="text-muted-foreground text-sm">
					Update the dates, capacity, status or visibility of this batch.
				</p>
			</div>

			<BatchForm
				mode="edit"
				batchId={batch.id}
				programs={programs.map((program) => ({
					id: program.id,
					title: program.title,
				}))}
				defaultValues={{
					programId: batch.programId,
					name: batch.name,
					startDate: toDateInput(batch.startDate),
					endDate: toDateInput(batch.endDate),
					schedule: batch.schedule,
					capacity: batch.capacity,
					status: batch.status,
					hidden: batch.hidden,
				}}
			/>
		</div>
	);
}
