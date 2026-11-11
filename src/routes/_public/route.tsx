import { createFileRoute, Outlet } from '@tanstack/react-router';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { getSession } from '@/lib/auth.functions';

export const Route = createFileRoute('/_public')({
	beforeLoad: async () => {
		const session = await getSession();
		return { session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<Header />
			<Outlet />
			<Footer />
		</div>
	);
}
