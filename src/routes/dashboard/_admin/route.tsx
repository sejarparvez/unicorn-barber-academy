import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/_admin')({
	beforeLoad: ({ context, location }) => {
		if (!context.session) {
			throw redirect({
				to: '/auth/signin',
				search: { redirect: location.href },
			});
		}

		if (context.session.user.role !== 'admin') {
			throw redirect({ to: '/dashboard' });
		}
	},
});
