import { createFileRoute, useRouteContext } from '@tanstack/react-router';
import { PasswordCard } from '@/components/pages/dashboard/account/password-card';
import { ProfileCard } from '@/components/pages/dashboard/account/profile-card';
import { getAccountSecurity } from '@/server/account';

export const Route = createFileRoute('/dashboard/account')({
	loader: () => getAccountSecurity(),
	head: () => ({
		meta: [
			{ title: 'Profile & security | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { hasPassword } = Route.useLoaderData();
	const { session } = useRouteContext({ from: '__root__' });

	if (!session?.user) {
		return null;
	}

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 pt-0">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Profile &amp; security
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage your personal details and how you sign in.
				</p>
			</div>

			<div className="grid items-start gap-6 lg:grid-cols-2">
				<ProfileCard user={session.user} />
				<PasswordCard hasPassword={hasPassword} />
			</div>
		</div>
	);
}
