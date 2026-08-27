import { Link } from "@tanstack/react-router";
import {
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	type Variants,
} from "motion/react";
import type { PropsWithChildren } from "react";
import banner from "@/assets/logo/banner.png";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* Gold-to-black gradient text, built from the theme's own chart scale. */
export const GOLD_TEXT =
	"bg-[linear-gradient(90deg,var(--chart-1),var(--primary),var(--chart-4))] bg-clip-text text-transparent";

const revealVariants: Variants = {
	hidden: { opacity: 0, y: 26 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
	},
};

/**
 * Page-level entrance: fades/slides content in on mount and re-runs on
 * route change (parent passes `key`). Deliberately subtle — a full
 * AnimatePresence exit dance costs more than it earns on an SSR site.
 */
export function PageTransition({
	children,
	pageKey,
}: PropsWithChildren<{ pageKey: string }>) {
	const shouldReduceMotion = useReducedMotion();
	if (shouldReduceMotion) return <>{children}</>;
	return (
		<motion.div
			key={pageKey}
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
		>
			{children}
		</motion.div>
	);
}

/** Thin gold reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
	const shouldReduceMotion = useReducedMotion();
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 28,
		restDelta: 0.001,
	});
	if (shouldReduceMotion) return null;
	return (
		<motion.div
			aria-hidden="true"
			className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-linear-to-r from-chart-1 via-primary to-chart-4"
			style={{ scaleX }}
		/>
	);
}

export function Reveal({
	children,
	delay = 0,
	className,
}: PropsWithChildren<{ delay?: number; className?: string }>) {
	const shouldReduceMotion = useReducedMotion();
	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}
	return (
		<motion.div
			className={className}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, margin: "-80px" }}
			variants={revealVariants}
			transition={{ delay }}
		>
			{children}
		</motion.div>
	);
}

/** Hero entrance helper: motion props for a fade-up, disabled when the user
    prefers reduced motion. Spread onto `motion.*` elements with a staggered
    `delay`. Shared by every page hero so timing stays consistent. */
export function useFadeUp() {
	const shouldReduceMotion = useReducedMotion();
	return (delay = 0) =>
		shouldReduceMotion
			? {}
			: {
					initial: { opacity: 0, y: 18 },
					animate: { opacity: 1, y: 0 },
					transition: {
						duration: 0.7,
						delay,
						ease: [0.16, 1, 0.3, 1] as const,
					},
				};
}

export function Grain({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay",
				className,
			)}
			style={{
				backgroundImage:
					"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
			}}
		/>
	);
}

/* The signature element: a guild seal referencing the "Barbers &
   Beauticians Guild" credential — crossed blades in a wax-seal ring. */
export function GuildSeal({ className }: { className?: string }) {
	const dots = Array.from({ length: 14 });
	return (
		<svg
			viewBox="0 0 120 120"
			className={className}
			aria-hidden="true"
			fill="none"
		>
			<circle cx="60" cy="60" r="57" stroke="currentColor" strokeWidth="1" />
			<circle
				cx="60"
				cy="60"
				r="47"
				stroke="currentColor"
				strokeWidth="0.5"
				opacity="0.6"
			/>
			{dots.map((_, i) => {
				const angle = (i / dots.length) * Math.PI * 2;
				const x = 60 + Math.cos(angle) * 52;
				const y = 60 + Math.sin(angle) * 52;
				return (
					<circle
						key={`dot-${
							// biome-ignore lint/suspicious/noArrayIndexKey: this is fine
							i
						}`}
						cx={x}
						cy={y}
						r="1.1"
						fill="currentColor"
					/>
				);
			})}
			<line
				x1="36"
				y1="44"
				x2="84"
				y2="76"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<line
				x1="84"
				y1="44"
				x2="36"
				y2="76"
				stroke="currentColor"
				strokeWidth="1.5"
			/>
			<circle cx="36" cy="44" r="3.2" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="84" cy="44" r="3.2" stroke="currentColor" strokeWidth="1.5" />
			<circle cx="60" cy="60" r="2" fill="currentColor" />
			<text
				x="60"
				y="99"
				textAnchor="middle"
				fontSize="7.5"
				letterSpacing="2.5"
				fill="currentColor"
				className="font-heading"
			>
				EST. GUILD
			</text>
		</svg>
	);
}

export function SectionEyebrow({
	title,
	id,
	as = "h2",
}: {
	guard: string;
	title: string;
	id: string;
	/** Render the title as a different element when a page <h1> leads the outline */
	as?: "h2" | "p";
}) {
	const shouldReduceMotion = useReducedMotion();
	const Title = as;
	return (
		<div className="flex items-center gap-4">
			<motion.span
				className="h-6 w-px origin-top bg-linear-to-b from-chart-1 via-primary to-chart-4"
				aria-hidden="true"
				initial={shouldReduceMotion ? {} : { scaleY: 0 }}
				whileInView={{ scaleY: 1 }}
				viewport={{ once: true, margin: "-60px" }}
				transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
			/>
			<div>
				<Title
					id={id}
					className="mt-1 font-heading text-3xl font-medium text-foreground sm:text-4xl"
				>
					{title}
				</Title>
			</div>
		</div>
	);
}

const CREDENTIALS = [
	"Nationally Registered Training Provider",
	"NTVQF Certified Curriculum",
	"Member, Bangladesh Barbers & Beauticians Guild",
];

export function TrustBar() {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return (
			<section
				className="border-b border-border bg-background px-6 py-6"
				aria-label="Accreditation"
			>
				<div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3">
					{CREDENTIALS.map((c) => (
						<span
							key={c}
							className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground"
						>
							{c.toUpperCase()}
						</span>
					))}
				</div>
			</section>
		);
	}

	const loop = [...CREDENTIALS, ...CREDENTIALS];

	return (
		<section
			className="overflow-hidden border-b border-border bg-background py-6"
			aria-label="Accreditation"
		>
			<span className="sr-only">{CREDENTIALS.join(" — ")}</span>
			<motion.div
				aria-hidden="true"
				className="flex w-max items-center gap-14"
				animate={{ x: ["0%", "-50%"] }}
				transition={{ duration: 30, ease: "linear", repeat: Infinity }}
			>
				{loop.map((c, i) => (
					<span
						key={`${c}-${
							// biome-ignore lint/suspicious/noArrayIndexKey: this is fine
							i
						}`}
						className="flex items-center gap-14 text-[11px] font-medium tracking-[0.14em] text-muted-foreground"
					>
						{c.toUpperCase()}
						<span className="h-1 w-1 shrink-0 rounded-full bg-primary/50" />
					</span>
				))}
			</motion.div>
		</section>
	);
}

export function FinalCta({
	title,
	accent,
	subtitle,
	ctaLabel = "ENROLL NOW",
	ctaTo = "/enroll",
}: {
	title: string;
	accent: string;
	subtitle: string;
	ctaLabel?: string;
	ctaTo?: string;
}) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<section className="relative overflow-hidden border-t border-primary/15 px-4 py-28 text-center lg:px-10">
			<Grain />
			<motion.div
				aria-hidden="true"
				className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-auto -translate-x-1/2 -translate-y-1/2"
				animate={shouldReduceMotion ? {} : { rotate: 360 }}
				transition={{ duration: 90, ease: "linear", repeat: Infinity }}
			>
				<img
					src={banner}
					alt=""
					className="h-full w-auto opacity-[0.04]"
					width={1698}
					height={365}
					loading="lazy"
				/>
			</motion.div>
			<Reveal className="relative mx-auto max-w-2xl">
				<h2 className="font-heading text-4xl font-medium sm:text-5xl">
					{title} <span className={cn("italic", GOLD_TEXT)}>{accent}</span>
				</h2>
				<p className="mt-5 text-base leading-relaxed text-secondary-foreground/65">
					{subtitle}
				</p>
				<div className="mt-10 flex justify-center">
					<Link
						to={ctaTo}
						className={cn(
							buttonVariants(),
							"glow-gold rounded-none bg-primary px-8 py-6 text-[12px] font-semibold tracking-[0.16em] text-primary-foreground hover:bg-primary/90",
						)}
					>
						{ctaLabel}
					</Link>
				</div>
			</Reveal>
		</section>
	);
}
