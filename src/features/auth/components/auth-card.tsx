// src/features/auth/components/auth-card.tsx
// Shared shell for /auth/* pages: a full-height white band holding one
// compact centered card. Deliberately hero-free — the sticky site header
// above and the footer below already carry the branding.
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import Logo from "@/assets/logo/logo.png";
import Logo64 from "@/assets/logo/logo-64.webp";
import Logo96 from "@/assets/logo/logo-96.webp";
import Logo192 from "@/assets/logo/logo-192.webp";

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
					<picture className="contents">
						<source
							type="image/webp"
							srcSet={`${Logo64} 64w, ${Logo96} 96w, ${Logo192} 192w`}
							sizes="48px"
						/>
						<img
							src={Logo}
							alt=""
							className="h-10 w-auto"
							width={550}
							height={454}
						/>
					</picture>
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
