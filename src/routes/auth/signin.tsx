import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { AuthAlert, AuthCard, AuthHero } from "@/components/site/auth";
import { useFadeUp } from "@/components/site/decor";
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
	const fadeUp = useFadeUp();
	const router = useRouter();
	const search = Route.useSearch();
	const [pending, setPending] = useState(false);
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

	return (
		<main className="min-h-screen">
			<AuthHero
				crumb="SIGN IN"
				title={
					<>
						Welcome back,{" "}
						<span className="text-primary italic">craftsman.</span>
					</>
				}
				subtitle="Sign in to continue your training at Unicorn Barber Training Academy."
			/>

			<AuthCard>
				<motion.div {...fadeUp(0)}>
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
							<Input
								id="password"
								name="password"
								type="password"
								required
								autoComplete="current-password"
								placeholder="••••••••"
							/>
						</div>

						{error ? <AuthAlert message={error} /> : null}

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={pending}
						>
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
				</motion.div>
			</AuthCard>
		</main>
	);
}
