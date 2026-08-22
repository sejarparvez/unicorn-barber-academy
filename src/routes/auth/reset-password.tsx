import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthAlert, AuthCard } from "@/components/site/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type ResetSearch = {
	token?: string;
};

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: (search: Record<string, unknown>): ResetSearch => ({
		token:
			typeof search.token === "string" && search.token.length > 0
				? search.token
				: undefined,
	}),
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: "Set a New Password | Unicorn Barber Training Academy" },
			{ name: "robots", content: "noindex" },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [pending, setPending] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

		if (!search.token) {
			setError(
				"This reset link is missing its token. Request a fresh link and try again.",
			);
			return;
		}

		const data = new FormData(event.currentTarget);
		const password = String(data.get("password") ?? "");
		const confirm = String(data.get("confirmPassword") ?? "");

		if (password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}
		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}

		setPending(true);
		try {
			const res = await authClient.resetPassword({
				newPassword: password,
				token: search.token,
			});
			if (res.error) {
				setError(
					res.error.message ??
						"This reset link is invalid or has expired. Please request a new one.",
				);
				return;
			}
			// Password changed — send them to sign in with the success banner.
			router.navigate({ to: "/auth/signin", search: { verified: "1" } });
		} catch (_err) {
			setError(
				"Network error while resetting your password. Please try again.",
			);
		} finally {
			setPending(false);
		}
	}

	return (
		<AuthCard
			title="Set a new password"
			subtitle="Choose a strong password you haven't used elsewhere."
		>
			<div className="mt-6">
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="password">New Password</Label>
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="At least 8 characters"
								className="pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								aria-label={showPassword ? "Hide password" : "Show password"}
								className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
							>
								{showPassword ? (
									<IconEyeOff className="h-4 w-4" stroke={1.75} />
								) : (
									<IconEye className="h-4 w-4" stroke={1.75} />
								)}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirm ? "text" : "password"}
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="Repeat your new password"
								className="pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowConfirm((v) => !v)}
								aria-label={showConfirm ? "Hide password" : "Show password"}
								className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground"
							>
								{showConfirm ? (
									<IconEyeOff className="h-4 w-4" stroke={1.75} />
								) : (
									<IconEye className="h-4 w-4" stroke={1.75} />
								)}
							</button>
						</div>
					</div>

					{!search.token ? (
						<AuthAlert message="No reset token found in this link. Request a fresh password reset email." />
					) : null}
					{error ? <AuthAlert message={error} /> : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={pending || !search.token}
					>
						{pending ? "Updating…" : "Update Password"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					<Link
						to="/auth/forgot-password"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Request a new reset link
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
