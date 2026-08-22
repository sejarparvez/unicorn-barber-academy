import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
	AuthAlert,
	AuthCard,
	AuthDivider,
	friendlyAuthError,
	GoogleIcon,
} from "@/components/site/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/signup")({
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: "Create Account | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Create your Unicorn Barber Training Academy account to enroll and manage your training.",
			},
			{ name: "robots", content: "noindex" },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [googlePending, setGooglePending] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);

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
		const res = await authClient.signUp.email({
			name: String(data.get("name") ?? ""),
			email: String(data.get("email") ?? ""),
			password,
		});

		setPending(false);
		if (res.error) {
			setError(
				res.error.message ?? "Unable to create account. Please try again.",
			);
			return;
		}
		// signUp.email signs the user in automatically — go to home.
		router.history.push("/");
	}

	async function handleGoogle() {
		setError(null);
		setGooglePending(true);
		const res = await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
		});
		if (res.error) {
			setGooglePending(false);
			setError(friendlyAuthError(res.error.message));
		}
		// On success better-auth redirects the whole browser to Google.
	}

	return (
		<AuthCard
			title="Create your account"
			subtitle="Enroll in programs and manage your training journey."
		>
			<div className="mt-6">
				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full gap-2.5 font-medium"
					onClick={handleGoogle}
					disabled={googlePending || pending}
				>
					<GoogleIcon className="h-4 w-4 shrink-0" />
					{googlePending ? "Redirecting…" : "Continue with Google"}
				</Button>

				<AuthDivider />

				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="name">Full Name</Label>
						<Input
							id="name"
							name="name"
							type="text"
							required
							autoComplete="name"
							placeholder="Your name"
						/>
					</div>

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

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
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
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirm ? "text" : "password"}
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="Repeat your password"
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

					{error ? <AuthAlert message={error} /> : null}

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Creating account…" : "Create Account"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{" "}
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
