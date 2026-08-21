import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { Program } from "@/lib/site-data";

/** Catalogue card used on /programs and in the "related programs" section
    of /programs/$slug. (The homepage shows its own Card-based variant.) */
export function ProgramCard({ program }: { program: Program }) {
	const trackLabel =
		program.track === "barbering" ? "Barbering" : "Beauty & Cosmetology";

	return (
		<Link
			to={program.to}
			className="group flex h-full flex-col overflow-hidden border border-border transition-colors hover:border-primary/40"
		>
			<div className="relative aspect-4/3 overflow-hidden">
				<Image
					src={program.image}
					alt={program.alt}
					layout="constrained"
					width={480}
					height={360}
					loading="lazy"
					className="h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />
				<span className="absolute left-4 top-4 border border-primary/50 bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.16em] text-primary backdrop-blur-sm">
					{trackLabel.toUpperCase()}
				</span>
			</div>
			<div className="flex flex-1 flex-col p-6">
				<div className="flex items-center gap-3 text-[11px] tracking-[0.14em] text-muted-foreground">
					<span>{program.duration.toUpperCase()}</span>
					<span className="h-1 w-1 rounded-full bg-primary/40" />
					<span>{program.level.toUpperCase()}</span>
				</div>
				<h3 className="mt-3 font-heading text-xl font-medium text-foreground group-hover:text-primary">
					{program.title}
				</h3>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					{program.description}
				</p>
				<ul className="mt-4 flex flex-wrap gap-2">
					{program.highlights.map((h) => (
						<li
							key={h}
							className="border border-border px-2.5 py-1 text-[10px] tracking-[0.06em] text-muted-foreground"
						>
							{h}
						</li>
					))}
				</ul>
				<span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-medium tracking-widest text-primary">
					VIEW CURRICULUM
					<IconArrowRight
						className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
						stroke={1.75}
					/>
				</span>
			</div>
		</Link>
	);
}
