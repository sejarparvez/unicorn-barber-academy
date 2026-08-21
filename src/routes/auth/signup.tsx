import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { AuthAlert, AuthCard, AuthHero } from "@/components/site/auth";
import { useFadeUp } from "@/components/site/decor";
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
	const fadeUp = useFadeUp();
	const router = useRouter();
	const [pending, setPending] = useState(false);
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

	return (
		<main className="min-h-screen">
			<AuthHero
				crumb="CREATE ACCOUNT"
				title={
					<>
						Join the <span className="text-primary italic">guild.</span>
					</>
				}
				subtitle="Create your account to enroll in programs and manage your training journey."
			/>

			<AuthCard>
				<motion.div {...fadeUp(0)}>
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
							<Input
								id="password"
								name="password"
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="At least 8 characters"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								minLength={8}
								autoComplete="new-password"
								placeholder="Repeat your password"
							/>
						</div>

						{error ? <AuthAlert message={error} /> : null}

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={pending}
						>
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
				</motion.div>
			</AuthCard>
		</main>
	);
}
