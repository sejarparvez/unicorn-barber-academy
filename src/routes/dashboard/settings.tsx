// routes/dashboard/settings.tsx
// Profile & account settings: display name, avatar (S3-backed), email
// verification, password change, and active session management — all via
// better-auth's client APIs.
import { IconDeviceLaptop, IconLogout, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
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

	// Root loader re-reads the session server-side on invalidate.
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

/* ------------------------------- profile -------------------------------- */

function ProfileCard({
	name,
	email,
	image,
	emailVerified,
	onChanged,
}: {
	name: string;
	email: string;
	image: string | null;
	emailVerified: boolean;
	onChanged: () => Promise<void> | void;
}) {
	const [displayName, setDisplayName] = useState(name);
	const [savingName, setSavingName] = useState(false);
	const [uploading, setUploading] = useState(false);
	const fileInput = useRef<HTMLInputElement>(null);

	async function saveName(event: React.FormEvent) {
		event.preventDefault();
		const next = displayName.trim();
		if (!next || next === name) return;
		setSavingName(true);
		try {
			const { error } = await authClient.updateUser({ name: next });
			if (error) throw new Error(error.message ?? "Could not save");
			toast.success("Profile updated");
			await onChanged();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save");
		} finally {
			setSavingName(false);
		}
	}

	async function uploadAvatar(file: File) {
		setUploading(true);
		try {
			const form = new FormData();
			form.set("file", file);
			const res = await fetch("/api/upload/avatar", {
				method: "POST",
				body: form,
			});
			const body = (await res.json().catch(() => ({}))) as {
				message?: string;
			};
			if (!res.ok) {
				throw new Error(body.message ?? "Upload failed");
			}
			toast.success("Avatar updated");
			await onChanged();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
			if (fileInput.current) fileInput.current.value = "";
		}
	}

	async function resendVerification() {
		try {
			const { error } = await authClient.sendVerificationEmail({
				email,
				callbackURL: "/dashboard/settings",
			});
			if (error) throw new Error(error.message ?? "Could not send");
			toast.success("Verification email sent — check your inbox");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not send");
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 className="font-heading text-lg font-semibold">Profile</h2>

			<div className="mt-5 flex flex-wrap items-center gap-5">
				<div className="relative">
					<Avatar className="h-16 w-16 border-2 border-primary/20">
						<AvatarImage src={image ?? undefined} alt={name || "User avatar"} />
						<AvatarFallback className="bg-primary/10 text-lg font-semibold">
							{getInitials(name)}
						</AvatarFallback>
					</Avatar>
					<button
						type="button"
						disabled={uploading}
						onClick={() => fileInput.current?.click()}
						className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
						aria-label="Change avatar"
					>
						<IconDeviceLaptop className="h-3 w-3" stroke={2} />
					</button>
					<input
						ref={fileInput}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						className="hidden"
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (file) void uploadAvatar(file);
						}}
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					JPEG, PNG or WebP · max 2 MB
				</p>
			</div>

			<form onSubmit={saveName} className="mt-6 grid gap-4 sm:max-w-md">
				<div className="space-y-1.5">
					<Label htmlFor="settings-name">Display name</Label>
					<div className="flex gap-2">
						<Input
							id="settings-name"
							value={displayName}
							maxLength={80}
							onChange={(event) => setDisplayName(event.target.value)}
						/>
						<Button
							type="submit"
							variant="outline"
							disabled={
								savingName ||
								displayName.trim() === name ||
								displayName.trim() === ""
							}
						>
							{savingName ? "Saving…" : "Save"}
						</Button>
					</div>
				</div>

				<div className="space-y-1.5">
					<Label>Email</Label>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-sm font-medium break-all">{email}</span>
						{emailVerified ? (
							<Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
								Verified
							</Badge>
						) : (
							<>
								<Badge
									variant="outline"
									className="h-5 px-1.5 text-[10px] text-amber-600"
								>
									Unverified
								</Badge>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={() => void resendVerification()}
								>
									Resend verification
								</Button>
							</>
						)}
					</div>
				</div>
			</form>
		</section>
	);
}

/* ------------------------------ password -------------------------------- */

function PasswordCard({
	onChanged,
}: {
	onChanged: () => Promise<void> | void;
}) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [busy, setBusy] = useState(false);

	async function changePassword(event: React.FormEvent) {
		event.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			toast.error("New password must be at least 8 characters");
			return;
		}
		setBusy(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: true,
			});
			if (error) {
				// Google-only accounts have no credential row to update.
				if (error.code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
					toast.error(
						"Your account signs in with Google. Use 'Forgot password' on the sign-in page to set an email password.",
					);
					return;
				}
				throw new Error(error.message ?? "Could not change password");
			}
			toast.success("Password changed — other sessions were signed out");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			await onChanged();
		} catch (err) {
			toast.error(
				err instanceof Error ? err.message : "Could not change password",
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<section className="rounded-xl border border-border bg-card p-6 shadow-sm">
			<h2 className="font-heading text-lg font-semibold">Password</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				Google-only accounts can set an email password via{" "}
				<a
					href="/auth/forgot-password"
					className="text-primary underline underline-offset-2"
				>
					Forgot password
				</a>{" "}
				on the sign-in page.
			</p>
			<form onSubmit={changePassword} className="mt-4 grid gap-4 sm:max-w-md">
				<div className="space-y-1.5">
					<Label htmlFor="current-password">Current password</Label>
					<Input
						id="current-password"
						type="password"
						autoComplete="current-password"
						value={currentPassword}
						onChange={(event) => setCurrentPassword(event.target.value)}
						required
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="new-password">New password</Label>
						<Input
							id="new-password"
							type="password"
							autoComplete="new-password"
							minLength={8}
							value={newPassword}
							onChange={(event) => setNewPassword(event.target.value)}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="confirm-password">Confirm new password</Label>
						<Input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							minLength={8}
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							required
						/>
					</div>
				</div>
				<div>
					<Button type="submit" disabled={busy}>
						{busy ? "Updating…" : "Update password"}
					</Button>
				</div>
			</form>
		</section>
	);
}

/* ------------------------------- sessions -------------------------------- */

type SessionInfo = {
	token: string;
	expiresAt: string;
	createdAt: string;
	userAgent?: string | null;
	ipAddress?: string | null;
};

function SessionsCard({
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
			setSessions((data as unknown as SessionInfo[]) ?? []);
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
						<li className="py-3 text-sm text-muted-foreground">
							Loading sessions…
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
