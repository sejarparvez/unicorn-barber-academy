import { createFileRoute, notFound } from '@tanstack/react-router';
import { ApplicationDetail } from '@/components/pages/dashboard/applications/application-detail';
import { getAdminApplication } from '@/server/admin/enrollments';

export const Route = createFileRoute(
	'/dashboard/_admin/applications/$enrollmentId',
)({
	loader: async ({ params }) => {
		const application = await getAdminApplication({
			data: { id: params.enrollmentId },
		});

		if (!application) {
			throw notFound();
		}

		return application;
	},
	head: () => ({
		meta: [
			{ title: 'Application | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const application = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 pt-0">
			<ApplicationDetail application={application} />
		</div>
	);
}
