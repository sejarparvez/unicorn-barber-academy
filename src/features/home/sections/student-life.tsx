/* --------------------------- Student Life --------------------------- */

import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/effects";
import { pic } from "@/data/images";
import { cn } from "@/lib/utils";

const GALLERY_ITEMS = [
	{
		seed: "unicorn-gallery-1",
		alt: "Barbering students practicing fades on mannequin heads",
	},
	{
		seed: "unicorn-gallery-2",
		alt: "Close-up of a professional makeup kit laid out for class",
	},
	{
		seed: "unicorn-gallery-3",
		alt: "Instructor demonstrating a straight-razor technique",
	},
	{
		seed: "unicorn-gallery-4",
		alt: "Beauty student styling hair during a practical session",
	},
	{
		seed: "unicorn-gallery-5",
		alt: "Graduating cohort posing together at the academy",
	},
	{
		seed: "unicorn-gallery-6",
		alt: "Row of barber chairs and styling stations in the training studio",
	},
];

export default function StudentLife() {
	return (
		<section
			className="border-t border-primary/15  px-6 py-24  lg:px-10"
			aria-labelledby="academy-heading"
		>
			<div className="mx-auto max-w-7xl">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<div className="flex items-center gap-4">
						<span
							className="h-6 w-px bg-linear-to-b from-[#F4C430] via-primary to-[#8B6914]"
							aria-hidden="true"
						/>
						<div>
							<h2
								id="academy-heading"
								className="mt-1 text-3xl sm:text-4xl"
								style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
							>
								Inside the Academy
							</h2>
						</div>
					</div>
					<Link
						to="/gallery"
						className="group inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.16em] text-secondary-foreground/70 hover:text-primary"
					>
						SEE FULL GALLERY
						<IconArrowRight
							className="h-4 w-4 transition-transform group-hover:translate-x-1"
							stroke={1.75}
						/>
					</Link>
				</div>

				<div className="mt-14 grid grid-cols-2 gap-3 lg:grid-cols-6">
					{GALLERY_ITEMS.map((item, i) => (
						<Reveal
							key={item.seed}
							delay={(i % 6) * 0.05}
							className={cn(
								i === 0 || i === 3 ? "col-span-2 row-span-2" : "col-span-1",
							)}
						>
							<div className="group relative h-full overflow-hidden">
								<img
									src={pic(item.seed, 700, 700)}
									alt={item.alt}
									loading="lazy"
									className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-110"
								/>
								<div className="absolute inset-0 bg-primary/0 transition-colors duration-500 group-hover:bg-primary/10" />
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
