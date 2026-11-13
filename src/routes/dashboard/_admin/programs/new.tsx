import { createFileRoute } from '@tanstack/react-router';
import {
	createEmptyProgram,
	ProgramForm,
} from '@/components/pages/dashboard/programs/program-form';
import { getAdminPrograms } from '@/server/admin/programs';

export const Route = createFileRoute('/dashboard/_admin/programs/new')({
	loader: () => getAdminPrograms(),
	head: () => ({
		meta: [
			{ title: 'New program | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const programs = Route.useLoaderData();
	const nextPosition = programs.length
		? Math.max(...programs.map((program) => program.position)) + 1
		: 1;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">New program</h1>
				<p className="text-muted-foreground text-sm">
					Add a program to the catalogue. It appears on the public site once
					saved, unless you mark it hidden.
				</p>
			</div>

			<ProgramForm
				mode="create"
				defaultValues={createEmptyProgram(nextPosition)}
			/>
		</div>
	);
}
