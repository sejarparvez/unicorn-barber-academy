import { createFileRoute, Outlet } from '@tanstack/react-router';
import Header from '@/components/layout/header';
import { getSession } from '@/lib/auth.functions';

export const Route = createFileRoute('/_public')({
	// Fetch the session once per navigation (server-side during SSR) and share
	// it through route context. `router.invalidate()` re-runs this, so the
	// header updates after sign-in/sign-out.
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
		</div>
	);
}
