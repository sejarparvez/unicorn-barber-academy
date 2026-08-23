import { IconEye, IconEyeOff } from "@tabler/icons-react";
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthAlert } from "@/features/auth/components/auth-alert";
import { AuthCard } from "@/features/auth/components/auth-card";
import { AuthDivider } from "@/features/auth/components/auth-divider";
import { GoogleIcon } from "@/features/auth/components/google-icon";
import { authClient } from "@/lib/auth-client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { safeRedirect } from "@/lib/redirect";
import { getSession } from "@/server/session";

type SignUpSearch = {
	redirect?: string;
};

export const Route = createFileRoute("/auth/signup")({
	validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
		redirect:
			typeof search.redirect === "string"
				? safeRedirect(search.redirect)
				: undefined,
	}),
	// Already signed in? There is nothing to do on this page.
	beforeLoad: async () => {
		if (await getSession()) throw redirect({ to: "/dashboard" });
	},
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
	const search = Route.useSearch();
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
		try {
			// callbackURL rides along so the EMAILED verification link lands the
			// user on /auth/verify-email?state=success — keeping any original
			// destination alive through the whole verify → sign-in chain.
			const successSearch = new URLSearchParams({ state: "success" });
			if (search.redirect) successSearch.set("redirect", search.redirect);
			const email = String(data.get("email") ?? "").trim();
			const res = await authClient.signUp.email({
				name: String(data.get("name") ?? "").trim(),
				email,
				password,
				callbackURL: `/auth/verify-email?${successSearch.toString()}`,
			});
			if (res.error) {
				setError(
					res.error.message ?? "Unable to create account. Please try again.",
				);
				return;
			}
			// Verification is mandatory (requireEmailVerification): no session is
			// issued until the emailed link is clicked. Route to the check-your-
			// inbox flow, keeping the original destination for afterwards.
			router.navigate({
				to: "/auth/verify-email",
				search: {
					email,
					redirect: search.redirect,
				},
			});
		} catch (_err) {
			setError(
				"Network error while creating your account. Check your connection and try again.",
			);
		} finally {
			setPending(false);
		}
	}

	async function handleGoogle() {
		setError(null);
		setGooglePending(true);
		try {
			const res = await authClient.signIn.social({
				provider: "google",
				callbackURL: search.redirect ?? "/",
			});
			if (res.error) {
				setError(friendlyAuthError(res.error.message));
				setGooglePending(false);
			}
			// On success better-auth redirects the whole browser to Google.
		} catch (_err) {
			setError(
				"Network error while starting Google sign-up. Please try again.",
			);
			setGooglePending(false);
		}
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
						search={{ redirect: search.redirect }}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
