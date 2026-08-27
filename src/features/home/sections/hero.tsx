// components/Hero.tsx
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useTransform,
} from "motion/react";
import { useRef } from "react";
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

export default function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const shouldReduceMotion = useReducedMotion();
	// Gentle scroll-linked parallax on the photo column.
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start start", "end start"],
	});
	const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
	const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

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
				{/* Content column */}
				<div className="flex flex-col justify-center px-4 py-16 sm:px-10 lg:min-h-[88vh] lg:px-14 lg:py-0">
					<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 flex items-center gap-3 font-mono text-[11px] tracking-[0.32em] text-primary">
						<span className="h-px w-8 bg-primary/70" />
						ENROLLMENT OPEN &mdash; FALL COHORT
					</p>

					<h1
						id="hero-heading"
						className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-[4.25rem]"
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

					<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-7 max-w-sm text-base leading-relaxed text-foreground/65 sm:text-lg">
						Fades, tapers, and straight-razor shaves — hands-on barbering
						training in Banasree, Dhaka, taught by working barbers, not
						textbooks.
					</p>

					<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
						<Link
							to="/enroll"
							className={cn(
								buttonVariants({ variant: "default" }),
								"glow-gold px-8 py-6 text-[12px] font-semibold tracking-[0.16em]",
							)}
						>
							ENROLL NOW
						</Link>

						<Link
							to="/programs/$slug"
							params={{ slug: "classic-barbering" }}
							className={cn(
								buttonVariants({ variant: "outline" }),
								" px-8 py-6 text-[12px] font-semibold tracking-[0.16em]",
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

				{/* Photo column — gentle parallax on scroll */}
				<div className="relative h-[46vh] overflow-hidden sm:h-[56vh] lg:h-[88vh]">
					<motion.div
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
							fetchPriority="high"
							loading="eager"
							className="h-full w-full object-cover contrast-[1.05] grayscale-15"
						/>
					</motion.div>
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
			</div>
		</section>
	);
}
