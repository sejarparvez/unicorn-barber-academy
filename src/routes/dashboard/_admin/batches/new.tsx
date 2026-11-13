import { createFileRoute } from '@tanstack/react-router';
import { BatchForm } from '@/components/pages/dashboard/batches/batch-form';
import type { BatchFormValues } from '@/components/pages/dashboard/batches/schemas';
import { getAdminPrograms } from '@/server/admin/programs';

export const Route = createFileRoute('/dashboard/_admin/batches/new')({
	loader: () => getAdminPrograms(),
	head: () => ({
		meta: [
			{ title: 'New batch | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const programs = Route.useLoaderData();

	const defaultValues: BatchFormValues = {
		programId: programs[0]?.id ?? '',
		name: 'Morning',
		startDate: new Date().toISOString().slice(0, 10),
		endDate: '',
		schedule: 'Sat–Thu, 9:00 AM–12:00 PM',
		capacity: 15,
		status: 'upcoming',
		hidden: false,
	};

	return (
		<div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">New batch</h1>
				<p className="text-muted-foreground text-sm">
					Add a cohort to a program. It appears on the public program page
					unless you mark it hidden.
				</p>
			</div>

			<BatchForm
				mode="create"
				programs={programs.map((program) => ({
					id: program.id,
					title: program.title,
				}))}
				defaultValues={defaultValues}
			/>
		</div>
	);
}
