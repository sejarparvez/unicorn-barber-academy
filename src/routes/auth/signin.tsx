import { IconEye, IconEyeOff } from "@tabler/icons-react";
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from "@tanstack/react-router";
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
import { getSession } from "@/lib/server-session";
import { safeRedirect } from "@/lib/utils";

type SignInSearch = {
	redirect?: string;
	reset?: string;
};

export const Route = createFileRoute("/auth/signin")({
	// safeRedirect here means the typed search param can never carry an
	// off-site target (protocol-relative "//host", backslash tricks, etc.).
	validateSearch: (search: Record<string, unknown>): SignInSearch => ({
		redirect:
			typeof search.redirect === "string"
				? safeRedirect(search.redirect)
				: undefined,
		reset: search.reset === "1" ? "1" : undefined,
	}),
	// Already signed in? There is nothing to do on this page.
	beforeLoad: async () => {
		if (await getSession()) throw redirect({ to: "/dashboard" });
	},
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: "Sign In | Unicorn Barber Training Academy" },
			{
				name: "description",
				content: "Sign in to your Unicorn Barber Training Academy account.",
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
	const [error, setError] = useState<string | null>(null);
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setUnverifiedEmail(null);
		setPending(true);

		try {
			const data = new FormData(event.currentTarget);
			const email = String(data.get("email") ?? "").trim();
			const res = await authClient.signIn.email({
				email,
				password: String(data.get("password") ?? ""),
			});
			if (res.error) {
				if (
					res.error.code === "EMAIL_NOT_VERIFIED" ||
					/not verified/i.test(res.error.message ?? "")
				) {
					setUnverifiedEmail(email);
					return;
				}
				setError(res.error.message ?? "Unable to sign in. Please try again.");
				return;
			}
			// Refresh loaders so the SSR-fetched header session updates too.
			router.invalidate();
			router.history.push(search.redirect ?? "/");
		} catch (_err) {
			setError(
				"Network error while signing in. Check your connection and try again.",
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
			// On success better-auth redirects the whole browser to Google —
			// nothing to do here.
		} catch (_err) {
			setError(
				"Network error while starting Google sign-in. Please try again.",
			);
			setGooglePending(false);
		}
	}

	return (
		<AuthCard
			title="Welcome back"
			subtitle="Sign in to continue your training at Unicorn Barber Training Academy."
		>
			<div className="mt-6">
				{unverifiedEmail ? (
					<div className="mb-5 space-y-3">
						<AuthAlert message="Please verify your email before signing in — we sent a link when you created your account." />
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full"
							disabled={pending}
							onClick={() =>
								router.navigate({
									to: "/auth/verify-email",
									search: {
										email: unverifiedEmail,
										redirect: search.redirect,
									},
								})
							}
						>
							Resend verification email
						</Button>
					</div>
				) : null}

				{search.reset === "1" && !error && !unverifiedEmail ? (
					<div className="mb-5">
						<AuthAlert
							tone="success"
							message="Password updated. Sign in with your new password to continue."
						/>
					</div>
				) : null}

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
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								to="/auth/forgot-password"
								className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>
						<div className="relative">
							<Input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								autoComplete="current-password"
								placeholder="••••••••"
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

					{error ? <AuthAlert message={error} /> : null}

					<Button type="submit" size="lg" className="w-full" disabled={pending}>
						{pending ? "Signing in…" : "Sign In"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					New to the academy?{" "}
					<Link
						to="/auth/signup"
						search={{ redirect: search.redirect }}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
