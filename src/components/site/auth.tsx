import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { ReactNode } from "react";
import Logo from "@/assets/logo/logo.png";

/**
 * Shared shell for /auth/* pages: a full-height white band holding one
 * compact centered card. Deliberately hero-free — the sticky site header
 * above and the footer below already carry the branding.
 */
export function AuthCard({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
}) {
	return (
		<main className="section-light flex min-h-[calc(100svh-4rem)] items-center justify-center bg-background px-4 py-12 sm:px-6">
			<div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
				{/* Brand mark — taps home */}
				<Link
					to="/"
					className="mx-auto flex w-fit items-center"
					aria-label="Unicorn Barber Training Academy, home"
				>
					<Image
						src={Logo}
						alt=""
						className="h-10 w-10"
						width={400}
						height={400}
					/>
				</Link>

				<div className="mt-5 text-center">
					<h1 className="font-heading text-2xl font-semibold tracking-tight">
						{title}
					</h1>
					{subtitle ? (
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{subtitle}
						</p>
					) : null}
				</div>

				{children}
			</div>
		</main>
	);
}

/** Official multicolor Google "G" for the social sign-in button. */
export function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={className ?? "h-4 w-4"}
		>
			<title>Google</title>
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11.99 11.99 0 0 0 12 23Z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09A7.1 7.1 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18a11.97 11.97 0 0 0 0 9.86l3.66-2.84Z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
			/>
		</svg>
	);
}

/** Hairline separator between the Google button and the email form. */
export function AuthDivider() {
	return (
		<div className="my-6 flex items-center gap-3">
			<span aria-hidden="true" className="h-px flex-1 bg-border" />
			<span className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
				or continue with email
			</span>
			<span aria-hidden="true" className="h-px flex-1 bg-border" />
		</div>
	);
}

/** Maps raw better-auth error messages to friendlier first-run copy. */
export function friendlyAuthError(message?: string | null): string {
	if (!message) return "Something went wrong. Please try again.";
	if (/provider|not configured|invalid oauth|unsupported/i.test(message)) {
		return "Google sign-in isn't configured yet — please use email and password.";
	}
	if (/popup|cancel|closed|abort/i.test(message)) {
		return "The Google window closed before finishing. Please try again.";
	}
	return message;
}

export function AuthAlert({
	message,
	tone = "error",
}: {
	message: string;
	tone?: "error" | "success";
}) {
	const styles =
		tone === "success"
			? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
			: "border-destructive/30 bg-destructive/10 text-destructive";
	return (
		<div
			role={tone === "success" ? "status" : "alert"}
			className={`rounded-md border px-3 py-2 text-sm ${styles}`}
		>
			{message}
		</div>
	);
}
