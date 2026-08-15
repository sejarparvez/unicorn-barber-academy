// components/Hero.tsx
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { BARBERING_PROGRAMS, INSTRUCTORS, pic } from "#/lib/site-data";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ----------------------------- Hero ----------------------------- */
/* Barbering-only, equal-width split. Text lives on a solid column so
   legibility never depends on an image gradient. The "trade ticket"
   straddling the seam is the one loud gesture — a barbershop
   claim-check stub with real numbers pulled from site-data. */

const gradientText =
	"bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-transparent";

export default function Hero() {
	const barberingInstructors = INSTRUCTORS.filter(
		(i) => i.track === "barbering",
	);
	const combinedYears = barberingInstructors.reduce(
		(sum, i) => sum + i.years,
		0,
	);

	const ticketRows = [
		{ label: "PROGRAMS", value: String(BARBERING_PROGRAMS.length) },
		{ label: "INSTRUCTORS", value: String(barberingInstructors.length) },
		{ label: "EXPERIENCE", value: `${combinedYears}+ YRS` },
		{ label: "CERTIFICATION", value: "NTVQF" },
	];

	return (
		<section
			className="relative bg-secondary text-secondary-foreground"
			aria-labelledby="hero-heading"
		>
			<div className="relative grid grid-cols-1 lg:grid-cols-2">
				{/* Content column — solid, no image behind the text */}
				<div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:min-h-[88vh] lg:px-14 lg:py-0">
					<p className="flex items-center gap-3 text-[11px] tracking-[0.32em] text-primary">
						<span className="h-px w-8 bg-primary/70" />
						ENROLLMENT OPEN &mdash; FALL COHORT
					</p>

					<h1
						id="hero-heading"
						className="mt-6 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl"
						style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
					>
						Where every fade
						<br />
						<span className={gradientText}>earns its stripes.</span>
					</h1>

					<p className="mt-7 max-w-sm text-base leading-relaxed text-secondary-foreground/70 sm:text-lg">
						Fades, tapers, and straight-razor shaves — hands-on barbering
						training in Gulshan, Dhaka, taught by working barbers, not
						textbooks.
					</p>

					<div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
						<Link
							to="/enroll"
							className={cn(
								buttonVariants({ variant: "default" }),
								"rounded-none border-primary px-8 py-6 text-[12px] font-semibold tracking-[0.16em]",
							)}
						>
							ENROLL NOW
						</Link>

						<Link
							to="/programs/barbering"
							className="group inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.12em] text-secondary-foreground/70 hover:text-primary"
						>
							VIEW THE PROGRAM
							<IconArrowRight
								className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
								stroke={1.75}
							/>
						</Link>
					</div>
				</div>

				{/* Photo column — equal width to the text column */}
				<div className="relative h-[46vh] sm:h-[56vh] lg:h-[88vh]">
					<Image
						src={pic("unicorn-hero-barbering", 1400, 1700)}
						alt="Barbering student practicing a fade haircut on a mannequin at Unicorn Barber Training Academy"
						layout="fullWidth"
						sizes="(min-width: 1024px) 50vw, 100vw"
						priority
						className="h-full w-full object-cover"
					/>
					{/* Thin gold edge where the photo meets the text column */}
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-y-0 left-0 hidden w-px bg-linear-to-b from-transparent via-primary to-transparent lg:block"
					/>
				</div>

				{/* Trade ticket — straddles the seam on desktop, sits inline on mobile */}
				<div className="relative z-10 -mt-8 flex justify-center px-6 lg:absolute lg:bottom-14 lg:left-1/2 lg:mt-0 lg:block lg:-translate-x-1/2 lg:px-0">
					<div className="w-full max-w-60 -rotate-2 border border-dashed border-primary/40 bg-secondary px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
						<p className="text-center text-[10px] tracking-[0.3em] text-primary">
							TRADE TICKET
						</p>
						<ul className="mt-3 space-y-2">
							{ticketRows.map((row) => (
								<li
									key={row.label}
									className="flex items-baseline justify-between gap-2 text-[11px]"
								>
									<span className="whitespace-nowrap tracking-[0.06em] text-secondary-foreground/55">
										{row.label}
									</span>
									<span
										aria-hidden="true"
										className="mb-0.75 flex-1 border-b border-dotted border-secondary-foreground/25"
									/>
									<span className="whitespace-nowrap font-semibold text-primary">
										{row.value}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
