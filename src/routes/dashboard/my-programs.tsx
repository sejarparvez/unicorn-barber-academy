import { createFileRoute } from '@tanstack/react-router';
import { MyProgramsList } from '@/components/pages/dashboard/my-programs/my-programs-list';
import { getMyEnrollments } from '@/server/enrollments';

export const Route = createFileRoute('/dashboard/my-programs')({
	loader: () => getMyEnrollments(),
	head: () => ({
		meta: [
			{ title: 'My programs | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const enrollments = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">My programs</h1>
				<p className="text-muted-foreground text-sm">
					Your applications and active batches. Admissions updates the status as
					your application progresses.
				</p>
			</div>

			<MyProgramsList enrollments={enrollments} />
		</div>
	);
}
