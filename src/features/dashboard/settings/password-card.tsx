// src/features/dashboard/settings/password-card.tsx
// Password change form with current/new/confirm fields. Handles
// Google-only accounts gracefully (no credential row to update).
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function PasswordCard({
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
