import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { AdminOverviewView } from '@/components/pages/dashboard/overview/admin-overview';
import { StudentOverviewView } from '@/components/pages/dashboard/overview/student-overview';
import { getDashboardOverview } from '@/server/dashboard';

export const Route = createFileRoute('/dashboard/')({
	loader: () => getDashboardOverview(),
	head: () => ({
		meta: [
			{ title: 'Overview | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const overview = Route.useLoaderData();
	const { session } = useRouteContext({ from: '__root__' });
	const firstName = session?.user?.name?.split(' ')[0];

	return (
		<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">
					{firstName ? `Welcome back, ${firstName}` : 'Overview'}
				</h1>
				<p className="text-muted-foreground text-sm">
					{overview.role === 'admin'
						? 'A snapshot of applications, students, finances and messages.'
						: 'Your programs, payments and certificates at a glance.'}
				</p>
			</div>

			{overview.role === 'admin' ? (
				<AdminOverviewView data={overview.admin} />
			) : (
				<StudentOverviewView data={overview.student} />
			)}
		</div>
	);
}
