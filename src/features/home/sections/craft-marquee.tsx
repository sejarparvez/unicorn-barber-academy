// src/features/home/sections/craft-marquee.tsx
// Bold display-type marquee of craft words between hero and stats —
// barbershop energy, deliberately louder than the quiet accreditation
// band in effects.tsx (TrustBar). Pure CSS loop; pauses on hover.
const CRAFT_WORDS = [
	"FADES",
	"TAPERS",
	"STRAIGHT RAZOR",
	"BEARD SCULPTING",
	"HOT TOWEL",
	"COLOUR",
	"STYLING",
	"BRIDAL",
];

export default function CraftMarquee() {
	const loop = [...CRAFT_WORDS, ...CRAFT_WORDS];
	return (
		<section
			aria-label="Crafts taught at the academy"
			className="overflow-hidden border-y border-primary/20 bg-secondary py-5"
		>
			<span className="sr-only">{CRAFT_WORDS.join(", ")}</span>
			<div className="group/marquee flex w-max animate-marquee items-center gap-10 group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
				{loop.map((word, i) => (
					<span
						key={`${word}-${
							// biome-ignore lint/suspicious/noArrayIndexKey: decorative loop copy
							i
						}`}
						className="flex items-center gap-10"
					>
						<span className="font-heading text-xl font-medium tracking-[0.18em] text-secondary-foreground/50 italic sm:text-2xl">
							{word}
						</span>
						<svg
							viewBox="0 0 24 24"
							className="h-4 w-4 shrink-0 text-primary/60"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.75"
							aria-hidden="true"
						>
							{/* Scissors glyph */}
							<circle cx="6" cy="6" r="2.5" />
							<circle cx="6" cy="18" r="2.5" />
							<path d="M8.2 7.6 20 19M8.2 16.4 20 5M14 12l1.5 1.5" />
						</svg>
					</span>
				))}
			</div>
		</section>
	);
}
