import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/programs')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Outlet />
		</div>
	);
}
