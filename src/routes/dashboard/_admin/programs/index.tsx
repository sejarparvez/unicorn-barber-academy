import { IconPlus } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ProgramsTable } from '@/components/pages/dashboard/programs/programs-table';
import { Button } from '@/components/ui/button';
import { getAdminPrograms } from '@/server/admin/programs';

export const Route = createFileRoute('/dashboard/_admin/programs/')({
	loader: () => getAdminPrograms(),
	head: () => ({
		meta: [
			{ title: 'Programs | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const programs = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 pt-0">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-semibold text-2xl tracking-tight">Programs</h1>
					<p className="text-muted-foreground text-sm">
						Create, edit, hide or remove the programs shown on the public site.
					</p>
				</div>

				<Button render={<Link to="/dashboard/programs/new" />}>
					<IconPlus stroke={1.75} />
					New program
				</Button>
			</div>

			<ProgramsTable programs={programs} />
		</div>
	);
}
