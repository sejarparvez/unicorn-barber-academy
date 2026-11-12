import { createFileRoute, Outlet } from '@tanstack/react-router';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';

export const Route = createFileRoute('/_public')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col">
			<Header />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}
