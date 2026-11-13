import { createFileRoute } from '@tanstack/react-router';
import { ApplicationsTable } from '@/components/pages/dashboard/applications/applications-table';
import { getAdminApplications } from '@/server/admin/enrollments';

export const Route = createFileRoute('/dashboard/_admin/applications/')({
	loader: () => getAdminApplications(),
	head: () => ({
		meta: [
			{ title: 'Applications | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const applications = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Applications</h1>
				<p className="text-muted-foreground text-sm">
					Review admission forms and move applicants through to enrolment.
				</p>
			</div>

			<ApplicationsTable applications={applications} />
		</div>
	);
}
