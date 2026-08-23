import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Grain, GuildSeal, useFadeUp } from "@/components/effects";

export function LegalHero({ title }: { title: string }) {
	const fadeUp = useFadeUp();

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 bg-black/60" />
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/65"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">{title.toUpperCase()}</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					{title}
				</motion.h1>
			</div>
		</section>
	);
}

export function LegalContent({ children }: { children: ReactNode }) {
	return (
		<div className="section-light bg-background px-6 py-16 lg:px-10">
			<div className="mx-auto max-w-3xl">
				<div className="prose prose-neutral max-w-none">{children}</div>
			</div>
		</div>
	);
}
