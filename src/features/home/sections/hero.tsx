// components/Hero.tsx
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import banner480 from "@/assets/logo/banner-480.webp";
import banner640 from "@/assets/logo/banner-640.webp";
import banner768 from "@/assets/logo/banner-768.webp";
import banner896 from "@/assets/logo/banner-896.webp";
import { buttonVariants } from "@/components/ui/button";
import { pic } from "@/data/images";
import { cn } from "@/lib/utils";

/* ----------------------------- Hero ----------------------------- */
/* Signature device: a clipper-guard gauge — a vertical ruler of real
   guard lengths (#0 skin to #4) running down the seam between copy
   and photo, the same reference a barber checks mid-fade. The photo
   column parallaxes gently on scroll; the gradient headline shimmers. */

const gradientText =
	"bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent";

/** Desktop-only (matches `lg:`): running `useScroll` against the hero section
 *  forces layout measurement on every scroll — pointless on mobile where the
 *  photo column is `hidden`. */
function HeroPhotoStatic() {
	return (
		<div className="relative hidden overflow-hidden lg:block lg:h-[88vh]">
			{/* Lazy + low priority on purpose: this column is `display: none`
			    on mobile, but eager images download even when CSS-hidden —
			    a 278 KiB hidden fetch would starve the mobile LCP banner.
			    On desktop (initial viewport) lazy still loads immediately,
			    just after the eager above-fold content. */}
			<Image
				src={pic("unicorn-hero-barbering", 1400, 1700)}
				alt="Barbering student practicing a fade haircut on a mannequin at Unicorn Barber Training Academy"
				layout="fullWidth"
				sizes="(min-width: 1024px) 50vw, 100vw"
				loading="lazy"
				fetchPriority="low"
				className="h-full w-full object-cover contrast-[1.05] grayscale-15"
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-linear-to-l from-transparent via-transparent to-background/20"
			/>
			{/* Gold hairline framing the photo edge */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-linear-to-b from-transparent via-primary/40 to-transparent lg:block"
			/>
		</div>
	);
}

/** Parallax upgrade: subscribes to scroll-linked motion only after the
 *  browser is idle (or the user first scrolls), so `useScroll` layout
 *  measurements never compete with LCP. Before upgrade, the static photo
 *  above paints immediately — same pixels, no pop-in (cached src). */
function HeroPhoto({
	sectionRef,
}: {
	sectionRef: React.RefObject<HTMLElement | null>;
}) {
	const [parallax, setParallax] = useState(false);
	useEffect(() => {
		let idleId: number | undefined;
		let fallbackId = 0;
		const enable = () => {
			setParallax(true);
			cleanup();
		};
		const cleanup = () => {
			window.removeEventListener("scroll", enable);
			if (idleId !== undefined) window.cancelIdleCallback(idleId);
			window.clearTimeout(fallbackId);
		};
		window.addEventListener("scroll", enable, { passive: true });
		if (typeof window.requestIdleCallback === "function") {
			idleId = window.requestIdleCallback(enable, { timeout: 2500 });
		} else {
			fallbackId = window.setTimeout(enable, 1500);
		}
		return cleanup;
	}, []);
	if (!parallax) return <HeroPhotoStatic />;
	return <HeroPhotoParallax sectionRef={sectionRef} />;
}

function HeroPhotoParallax({
	sectionRef,
}: {
	sectionRef: React.RefObject<HTMLElement | null>;
}) {
	const shouldReduceMotion = useReducedMotion();
	// Gentle scroll-linked parallax on the photo column.
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});
	const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
	const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

	return (
		<div className="relative hidden overflow-hidden lg:block lg:h-[88vh]">
			<m.div
				style={
					shouldReduceMotion ? undefined : { y: photoY, scale: photoScale }
				}
				className="h-full w-full"
			>
				<Image
					src={pic("unicorn-hero-barbering", 1400, 1700)}
					alt="Barbering student practicing a fade haircut on a mannequin at Unicorn Barber Training Academy"
					layout="fullWidth"
					sizes="(min-width: 1024px) 50vw, 100vw"
					loading="lazy"
					fetchPriority="low"
					className="h-full w-full object-cover contrast-[1.05] grayscale-15"
				/>
			</m.div>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-linear-to-l from-transparent via-transparent to-background/20"
			/>
			{/* Gold hairline framing the photo edge */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-linear-to-b from-transparent via-primary/40 to-transparent lg:block"
			/>
		</div>
	);
}

export default function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const shouldReduceMotion = useReducedMotion();

	return (
		<section
			ref={sectionRef}
			className="relative overflow-hidden bg-background text-foreground"
			aria-labelledby="hero-heading"
		>
			{/* Faint cape-linen texture — barely there, adds tactility without noise */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 opacity-[0.05]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 14px)",
					color: "var(--primary)",
				}}
			/>

			<div className="relative mx-auto grid max-w-350 grid-cols-1 lg:grid-cols-[1fr_auto_1fr]">
				{/* Brand banner — mobile only, shows first */}
				<div className="order-1 flex items-center justify-center bg-[#0d0d0f] -ml-8 pt-6 pb-5 lg:hidden">
					<picture>
						<source
							type="image/webp"
							srcSet={`${banner480} 480w, ${banner640} 640w, ${banner768} 768w, ${banner896} 896w`}
							sizes="100vw"
						/>
						<img
							src={banner480}
							alt="Unicorn Barber Training Academy"
							className="h-auto w-full"
							width={480}
							height={240}
							fetchPriority="high"
							loading="eager"
							decoding="async"
						/>
					</picture>
				</div>

				{/* Content column */}
				<div className="order-2 flex flex-col justify-center px-5 pt-10 pb-20 sm:px-10 lg:order-none lg:min-h-[88vh] lg:px-14 lg:py-0">
					<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex items-center gap-3 font-mono text-xs tracking-[0.28em] text-primary">
						<span
							aria-hidden="true"
							className="h-1.5 w-1.5 rounded-full bg-primary"
						/>
						ENROLLMENT OPEN &mdash; FALL COHORT
					</p>

					<h1
						id="hero-heading"
						className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-5 text-[clamp(2.75rem,12vw,4.5rem)] leading-[1.0] tracking-tight sm:text-6xl lg:text-[4.25rem] lg:tracking-normal"
						style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
					>
						Master the fade.
						<br />
						<span
							className={cn(
								gradientText,
								"italic",
								!shouldReduceMotion && "text-shimmer",
							)}
						>
							Earn the chair.
						</span>
					</h1>

					<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-5 max-w-md text-[17px] leading-relaxed text-foreground/70 sm:text-lg">
						Fades, tapers, and straight-razor shaves — hands-on barbering
						training in Banasree, Dhaka, taught by working barbers, not
						textbooks.
					</p>

					<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-4 lg:w-auto">
						<Link
							to="/enroll"
							className={cn(
								buttonVariants({ variant: "default" }),
								"glow-gold justify-center px-8 py-6 text-[12px] font-semibold tracking-[0.16em]",
							)}
						>
							ENROLL NOW
						</Link>

						<Link
							to="/programs"
							className={cn(
								buttonVariants({ variant: "ghost" }),
								"justify-center px-8 py-6 text-[12px] font-semibold tracking-[0.16em] text-foreground/80 sm:text-foreground",
							)}
						>
							SEE THE CURRICULUM
							<IconArrowRight
								className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
								stroke={1.75}
							/>
						</Link>
					</div>
				</div>

				{/* Guard gauge — the signature element, desktop only */}
				<div
					aria-hidden="true"
					className="relative hidden w-14 shrink-0 lg:flex lg:flex-col lg:items-center lg:justify-center"
				></div>

				{/* Photo column — desktop only via CSS (`hidden lg:block` inside),
				    so the LCP element exists in SSR HTML instead of mounting
				    after a `matchMedia` effect. */}
				<HeroPhoto sectionRef={sectionRef} />
			</div>
			{/* Bottom fade into the marquee — mobile only, softens the exit */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-background lg:hidden"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent lg:hidden"
			/>
		</section>
	);
}
