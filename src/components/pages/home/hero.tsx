// components/Hero.tsx
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { buttonVariants } from "@/components/ui/button";
import { pic } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/* ----------------------------- Hero ----------------------------- */
/* Signature device: a clipper-guard gauge — a vertical ruler of real
   guard lengths (#0 skin to #4) running down the seam between copy
   and photo, the same reference a barber checks mid-fade.

   Type note: --font-heading currently resolves to Inter. For the full
   effect, swap in a characterful serif for headings (e.g. install
   @fontsource-variable/fraunces and point --font-heading at it) — the
   headline below is sized to carry a serif well. It still reads fine
   on Inter if that swap doesn't happen. */

const gradientText =
	"bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent";

export default function Hero() {
	return (
		<section
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
						className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-100 mt-6 text-4xl leading-[1.04] sm:text-5xl lg:text-[3.75rem]"
						style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
					>
						Master the fade.
						<br />
						<span className={gradientText}>Earn the chair.</span>
					</h1>

					<p className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-150 mt-7 max-w-sm text-base leading-relaxed text-foreground/65 sm:text-lg">
						Fades, tapers, and straight-razor shaves — hands-on barbering
						training in Gulshan, Dhaka, taught by working barbers, not
						textbooks.
					</p>

					<div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:delay-200 mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
						<Link
							to="/enroll"
							className={cn(
								buttonVariants({ variant: "default" }),
								" px-8 py-6 text-[12px] font-semibold tracking-[0.16em]",
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

				{/* Photo column */}
				<div className="relative h-[46vh] sm:h-[56vh] lg:h-[88vh]">
					<Image
						src={pic("unicorn-hero-barbering", 1400, 1700)}
						alt="Barbering student practicing a fade haircut on a mannequin at Unicorn Barber Training Academy"
						layout="fullWidth"
						sizes="(min-width: 1024px) 50vw, 100vw"
						fetchPriority="high"
						loading="eager"
						className="h-full w-full object-cover contrast-[1.05] grayscale-15"
					/>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-linear-to-l from-transparent via-transparent to-background/20"
					/>
				</div>
			</div>
		</section>
	);
}
