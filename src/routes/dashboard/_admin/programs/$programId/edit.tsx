import { createFileRoute, notFound } from '@tanstack/react-router';
import { ProgramForm } from '@/components/pages/dashboard/programs/program-form';
import { getAdminProgram } from '@/server/admin/programs';

export const Route = createFileRoute(
	'/dashboard/_admin/programs/$programId/edit',
)({
	loader: async ({ params }) => {
		const program = await getAdminProgram({ data: { id: params.programId } });

		if (!program) {
			throw notFound();
		}

		return program;
	},
	head: () => ({
		meta: [
			{ title: 'Edit program | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const program = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					Edit {program.title}
				</h1>
				<p className="text-muted-foreground text-sm">
					Update the details, curriculum and visibility of this program.
				</p>
			</div>

			<ProgramForm mode="edit" programId={program.id} defaultValues={program} />
		</div>
	);
}
