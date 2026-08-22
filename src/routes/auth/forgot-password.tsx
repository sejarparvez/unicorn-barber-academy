import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthAlert, AuthCard } from "@/components/site/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/forgot-password")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: "Reset Password | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Request a password reset link for your Unicorn Barber Training Academy account.",
			},
			{ name: "robots", content: "noindex" },
		],
	}),
});

function RouteComponent() {
	const [pending, setPending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setPending(true);

		try {
			const data = new FormData(event.currentTarget);
			const res = await authClient.requestPasswordReset({
				email: String(data.get("email") ?? ""),
				// better-auth validates the emailed token server-side and lands the
				// user here with ?token=… for the new-password form.
				redirectTo: "/auth/reset-password",
			});
			if (res.error) {
				setError(res.error.message ?? "Unable to send reset link.");
				return;
			}
			setSent(true);
		} catch (_err) {
			setError("Network error while sending the reset link. Please try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<AuthCard
			title="Forgot your password?"
			subtitle="Enter your account email and we'll send you a link to set a new password."
		>
			<div className="mt-6">
				{sent ? (
					<div className="space-y-5">
						<AuthAlert
							tone="success"
							message="If that email belongs to an academy account, a reset link is on its way. It expires in one hour."
						/>
						<p className="text-center text-sm text-muted-foreground">
							Didn't get it? Check your spam folder or{" "}
							<button
								type="button"
								onClick={() => setSent(false)}
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								try again
							</button>
							.
						</p>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="you@example.com"
							/>
						</div>

						{error ? <AuthAlert message={error} /> : null}

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={pending}
						>
							{pending ? "Sending…" : "Send Reset Link"}
						</Button>
					</form>
				)}

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Remembered it after all?{" "}
					<Link
						to="/auth/signin"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
