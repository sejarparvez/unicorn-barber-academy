import { createFileRoute } from '@tanstack/react-router';
import { EnquiriesList } from '@/components/pages/dashboard/enquiries/enquiries-list';
import { getAdminEnquiries } from '@/server/admin/enquiries';

export const Route = createFileRoute('/dashboard/_admin/enquiries/')({
	loader: () => getAdminEnquiries(),
	head: () => ({
		meta: [
			{ title: 'Enquiries | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { enquiries, stats } = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Enquiries</h1>
				<p className="text-muted-foreground text-sm">
					Messages sent through the public contact form. Reply by email, then
					move each one along.
				</p>
			</div>

			<EnquiriesList enquiries={enquiries} stats={stats} />
		</div>
	);
}
