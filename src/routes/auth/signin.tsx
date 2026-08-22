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

type SignInSearch = {
	redirect?: string;
};

export const Route = createFileRoute("/auth/signin")({
	validateSearch: (search: Record<string, unknown>): SignInSearch => ({
		redirect:
			typeof search.redirect === "string" && search.redirect.startsWith("/")
				? search.redirect
				: undefined,
	}),
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

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setPending(true);

		const data = new FormData(event.currentTarget);
		const res = await authClient.signIn.email({
			email: String(data.get("email") ?? ""),
			password: String(data.get("password") ?? ""),
		});

		setPending(false);
		if (res.error) {
			setError(res.error.message ?? "Unable to sign in. Please try again.");
			return;
		}
		router.history.push(search.redirect ?? "/");
	}

	async function handleGoogle() {
		setError(null);
		setGooglePending(true);
		const res = await authClient.signIn.social({
			provider: "google",
			callbackURL: search.redirect ?? "/",
		});
		if (res.error) {
			setGooglePending(false);
			setError(friendlyAuthError(res.error.message));
		}
		// On success better-auth redirects the whole browser to Google —
		// nothing to do here.
	}

	return (
		<AuthCard
			title="Welcome back"
			subtitle="Sign in to continue your training at Unicorn Barber Training Academy."
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
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
