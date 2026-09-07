// src/features/dashboard/settings/sessions-card.tsx
// Active session management: lists devices with better-auth's listSessions(),
// allows revoking individual sessions (or all others on password change).
import { IconDeviceLaptop, IconLogout, IconTrash } from "@tabler/icons-react";
import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

type SessionInfo = {
	token: string;
	expiresAt: string;
	createdAt: string;
	userAgent?: string | null;
	ipAddress?: string | null;
};

/** Narrow better-auth's listSessions response to our SessionInfo shape. */
function toSessionList(data: unknown): SessionInfo[] {
	if (!Array.isArray(data)) return [];
	return data.map((s) => ({
		token: String(s.token ?? ""),
		expiresAt: String(s.expiresAt ?? ""),
		createdAt: String(s.createdAt ?? ""),
		userAgent: s.userAgent ?? null,
		ipAddress: s.ipAddress ?? null,
	}));
}

export function SessionsCard({
	onChanged,
}: {
	onChanged: () => Promise<void> | void;
}) {
	const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [currentToken, setCurrentToken] = useState<string | null>(null);
	const [busyToken, setBusyToken] = useState<string | null>(null);
	const router = useRouter();

	// listSessions requires a fresh (<24h) session and is NOT ordered with
	// the current one first — identify "this device" by token instead.
	useEffect(() => {
		void (async () => {
			const { data: active } = await authClient.getSession();
			setCurrentToken(active?.session?.token ?? null);

			const { data, error } = await authClient.listSessions();
			if (error) {
				setLoadError(
					error.status === 403
						? "For security, session management needs a recent sign-in. Sign out and back in to view devices."
						: (error.message ?? "Could not load sessions"),
				);
				setSessions([]);
				return;
			}
			setSessions(toSessionList(data) ?? []);
		})();
	}, []);

	async function revoke(token: string) {
		const isCurrent = token === currentToken;
		setBusyToken(token);
		try {
			const { error } = await authClient.revokeSession({ token });
			if (error) throw new Error(error.message ?? "Could not sign out");
			if (isCurrent) {
				toast.success("This device was signed out");
				void router.navigate({ to: "/auth/signin" });
				return;
			}
			toast.success("Session signed out");
			setSessions((prev) =>
				prev ? prev.filter((s) => s.token !== token) : prev,
			);
			await onChanged();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not sign out");
		} finally {
			setBusyToken(null);
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 className="font-heading text-lg font-semibold">Active sessions</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Devices currently signed in to this account.
			</p>
			{loadError ? (
				<p
					role="alert"
					className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700"
				>
					{loadError}
				</p>
			) : (
				<ul className="mt-4 divide-y divide-border">
					{sessions === null && !loadError ? (
						<li className="py-3">
							<div className="flex items-center gap-3">
								<Skeleton className="h-4 w-4 rounded" />
								<div className="flex-1 space-y-1.5">
									<Skeleton className="h-3.5 w-32" />
									<Skeleton className="h-3 w-48" />
								</div>
							</div>
						</li>
					) : null}
					{(sessions ?? []).map((sessionItem) => {
						const isCurrent = sessionItem.token === currentToken;
						return (
							<li
								key={sessionItem.token}
								className="flex items-center gap-3 py-3"
							>
								<IconDeviceLaptop
									className="h-4 w-4 shrink-0 text-muted-foreground"
									stroke={1.75}
								/>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium">
										{isCurrent
											? "This device"
											: (sessionItem.userAgent ?? "Unknown device")}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										Expires{" "}
										{new Date(sessionItem.expiresAt).toLocaleDateString()}
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="gap-1.5 text-destructive hover:text-destructive"
									disabled={busyToken === sessionItem.token}
									onClick={() => void revoke(sessionItem.token)}
								>
									{isCurrent ? (
										<IconLogout className="h-3.5 w-3.5" stroke={1.75} />
									) : (
										<IconTrash className="h-3.5 w-3.5" stroke={1.75} />
									)}
									Sign out
								</Button>
							</li>
						);
					})}
					{sessions !== null && sessions.length === 0 && !loadError ? (
						<li className="py-3 text-sm text-muted-foreground">
							No sessions found.
						</li>
					) : null}
				</ul>
			)}
			<Separator className="mt-2" />
		</section>
	);
}
