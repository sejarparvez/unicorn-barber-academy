import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type FormEvent, useEffect, useState } from "react";
import { AuthAlert, AuthCard } from "@/components/site/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { safeRedirect } from "@/lib/utils";

type VerifySearch = {
	email?: string;
	state?: string;
	redirect?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

export const Route = createFileRoute("/auth/verify-email")({
	validateSearch: (search: Record<string, unknown>): VerifySearch => ({
		email:
			typeof search.email === "string" && EMAIL_RE.test(search.email)
				? search.email
				: undefined,
		state: search.state === "success" ? "success" : undefined,
		redirect:
			typeof search.redirect === "string"
				? safeRedirect(search.redirect)
				: undefined,
	}),
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: "Verify Your Email | Unicorn Barber Training Academy" },
			{ name: "robots", content: "noindex" },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [pending, setPending] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const timer = setInterval(() => {
			setCooldown((s) => s - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	function successCallbackURL(): string {
		const url = new URL("/auth/verify-email", window.location.origin);
		url.searchParams.set("state", "success");
		if (search.redirect) url.searchParams.set("redirect", search.redirect);
		return `${url.pathname}${url.search}`;
	}

	async function resend(email: string) {
		setError(null);
		setPending(true);
		try {
			const res = await authClient.sendVerificationEmail({
				email,
				callbackURL: successCallbackURL(),
			});
			if (res.error) {
				setError(
					res.error.message ??
						"Unable to send the verification email. Please try again.",
				);
				return;
			}
			// Enumeration-safe: the server never confirms whether the address exists.
			setSent(true);
			setCooldown(RESEND_COOLDOWN_SECONDS);
		} catch (_err) {
			setError("Network error while sending the email. Please try again.");
		} finally {
			setPending(false);
		}
	}

	async function handleResend(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		await resend(String(data.get("email") ?? search.email ?? ""));
	}

	if (search.state === "success") {
		const destination = search.redirect ?? "/dashboard";
		return (
			<AuthCard
				title="Email verified"
				subtitle="Your account is fully activated — welcome to the academy."
			>
				<div className="mt-6 space-y-5">
					<AuthAlert
						tone="success"
						message="You're signed in and ready to go."
					/>
					<Button
						size="lg"
						className="w-full"
						onClick={() => {
							router.invalidate();
							router.history.push(destination);
						}}
					>
						Go to Dashboard
					</Button>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title="Check your inbox"
			subtitle="We sent a verification link to your email address. Click it to activate your account."
		>
			<div className="mt-6">
				<form onSubmit={handleResend} className="space-y-5">
					<div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
						<p className="text-muted-foreground">Verification sent to</p>
						<p className="mt-0.5 font-medium break-all">
							{search.email ?? "your email address"}
						</p>
					</div>

					{!search.email ? (
						<div className="space-y-2">
							<Label htmlFor="email">Email address</Label>
							<Input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
								placeholder="you@example.com"
							/>
						</div>
					) : (
						<input type="hidden" name="email" value={search.email} />
					)}

					{sent ? (
						<AuthAlert
							tone="success"
							message="If that email belongs to an academy account, a fresh verification link is on its way."
						/>
					) : null}
					{error ? <AuthAlert message={error} /> : null}

					<Button
						type="submit"
						variant="outline"
						size="lg"
						className="w-full"
						disabled={pending || cooldown > 0 || !search.email}
					>
						{cooldown > 0
							? `Resend available in ${cooldown}s`
							: pending
								? "Sending…"
								: "Resend Verification Email"}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Wrong address or already verified?{" "}
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
