/* --------------------------- Student Life --------------------------- */

import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/effects";
import type { GalleryView } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function StudentLife({ items }: { items: GalleryView[] }) {
	return (
		<section
			className="border-t border-primary/15  px-4 py-24  lg:px-10"
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
					{items.slice(0, 6).map((item, i) => (
						<Reveal
							key={item.id}
							delay={(i % 6) * 0.05}
							className={cn(
								i === 0 || i === 3 ? "col-span-2 row-span-2" : "col-span-1",
							)}
						>
							<div className="group relative h-full overflow-hidden">
								<img
									src={item.image}
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
