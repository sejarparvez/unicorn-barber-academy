import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Grain, GuildSeal, useFadeUp } from "@/components/site/decor";

/**
 * Shared shell for /auth/* pages: dark hero band (breadcrumb + seal + title)
 * and the centered form card beneath it.
 */
export function AuthHero({
	crumb,
	title,
	subtitle,
}: {
	crumb: string;
	title: ReactNode;
	subtitle?: string;
}) {
	const fadeUp = useFadeUp();

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 bg-black/60" />
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">{crumb}</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-4xl font-medium leading-[1.1] sm:text-5xl"
				>
					{title}
				</motion.h1>

				{subtitle ? (
					<motion.p
						{...fadeUp(0.18)}
						className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-secondary-foreground/70"
					>
						{subtitle}
					</motion.p>
				) : null}
			</div>
		</section>
	);
}

export function AuthCard({ children }: { children: ReactNode }) {
	return (
		<section className="section-light bg-background px-6 py-16 lg:py-20">
			<div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-card-foreground shadow-sm">
				{children}
			</div>
		</section>
	);
}

export function AuthAlert({ message }: { message: string }) {
	return (
		<div
			role="alert"
			className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
		>
			{message}
		</div>
	);
}
