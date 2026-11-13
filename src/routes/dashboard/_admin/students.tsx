import { createFileRoute } from '@tanstack/react-router';
import { StudentsTable } from '@/components/pages/dashboard/students/students-table';
import { getAdminStudents } from '@/server/admin/enrollments';

export const Route = createFileRoute('/dashboard/_admin/students')({
	loader: () => getAdminStudents(),
	head: () => ({
		meta: [
			{ title: 'Students | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const students = Route.useLoaderData();

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="font-semibold text-2xl tracking-tight">Students</h1>
				<p className="text-muted-foreground text-sm">
					Everyone with an account, their active programs and applications.
				</p>
			</div>

			<StudentsTable students={students} />
		</div>
	);
}
