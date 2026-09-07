// routes/dashboard/settings.tsx
// Profile & account settings: display name, avatar (Cloudinary-backed), email
// verification, password change, and active session management — all via
// better-auth's client APIs. Sub-components live in src/features/dashboard/settings/.
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { PasswordCard } from "@/features/dashboard/settings/password-card";
import { ProfileCard } from "@/features/dashboard/settings/profile-card";
import { SessionsCard } from "@/features/dashboard/settings/sessions-card";
import { requireRoles } from "@/server/guards";

export const Route = createFileRoute("/dashboard/settings")({
	beforeLoad: async ({ location }) => {
		const session = await requireRoles({
			pathname: location.pathname,
			search: location.search as Record<string, string>,
		});
		return { session };
	},
	head: () => ({
		meta: [
			{ title: "Settings | Dashboard" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: SettingsPage,
});

function SettingsPage() {
	const { session } = Route.useRouteContext();
	const router = useRouter();

	async function refreshSession() {
		await router.invalidate();
	}

	return (
		<div className="space-y-8">
			<header>
				<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
					Account
				</p>
				<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
					Settings
				</h1>
			</header>

			<ProfileCard
				name={session.user.name ?? ""}
				email={session.user.email}
				image={session.user.image}
				emailVerified={session.user.emailVerified}
				onChanged={refreshSession}
			/>
			<PasswordCard onChanged={refreshSession} />
			<SessionsCard onChanged={refreshSession} />
		</div>
	);
}
