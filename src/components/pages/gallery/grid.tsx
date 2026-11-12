import { IconMaximize } from '@tabler/icons-react';
import { Image } from '@unpic/react';
import { useState } from 'react';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { Badge } from '@/components/ui/badge';
import {
	GALLERY_FILTERS,
	GALLERY_IMAGES,
	type GalleryFilter,
} from '@/data/gallery';
import { cn } from '@/lib/utils';
import GalleryLightbox from './lightbox';

function countFor(filter: GalleryFilter) {
	return filter === 'All'
		? GALLERY_IMAGES.length
		: GALLERY_IMAGES.filter((image) => image.category === filter).length;
}

export default function GalleryGrid() {
	const [activeFilter, setActiveFilter] = useState<GalleryFilter>('All');
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const visibleImages =
		activeFilter === 'All'
			? GALLERY_IMAGES
			: GALLERY_IMAGES.filter((image) => image.category === activeFilter);

	const selectFilter = (filter: GalleryFilter) => {
		setActiveFilter(filter);
		setActiveIndex(null);
	};

	return (
		<section
			id="gallery"
			aria-labelledby="gallery-heading"
			className="section-light relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-background px-4 py-24 sm:px-6 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute -top-24 right-0 size-[26rem] rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto max-w-7xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<SectionHeading
						id="gallery-heading"
						as="h1"
						eyebrow="From the floor"
						title={
							<>
								The work, <span className="text-primary">unfiltered</span>.
							</>
						}
						description="No stock smiles, no staged showroom. Browse the crafts we actually teach, then open any frame to see it full size."
					/>

					<Badge
						variant="outline"
						className="shrink-0 self-start border-primary/30 text-[9px] text-primary tracking-[0.18em] sm:self-auto"
					>
						{GALLERY_IMAGES.length} FRAMES
					</Badge>
				</div>

				<div className="mt-10 flex flex-col gap-4 border-border/60 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
					<fieldset className="m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0">
						<legend className="sr-only">Filter gallery by craft</legend>
						{GALLERY_FILTERS.map((filter) => {
							const active = activeFilter === filter;

							return (
								<button
									key={filter}
									type="button"
									onClick={() => selectFilter(filter)}
									aria-pressed={active}
									className={cn(
										'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-semibold text-[10px] uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
										active
											? 'border-primary bg-primary text-primary-foreground'
											: 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary',
									)}
								>
									{filter}
									<span
										className={cn(
											'rounded-full px-1.5 py-0.5 font-mono text-[9px]',
											active
												? 'bg-primary-foreground/15 text-primary-foreground'
												: 'bg-muted text-muted-foreground',
										)}
									>
										{countFor(filter)}
									</span>
								</button>
							);
						})}
					</fieldset>

					<p
						aria-live="polite"
						className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.16em]"
					>
						Showing {visibleImages.length} of {GALLERY_IMAGES.length}
					</p>
				</div>

				{/* CSS masonry: images keep their native proportions instead of being
				    cropped into a uniform grid. */}
				<ul className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
					{visibleImages.map((image, index) => (
						<li key={image.id} className="mb-4 break-inside-avoid">
							<button
								type="button"
								onClick={() => setActiveIndex(index)}
								aria-label={`Open larger image: ${image.caption}`}
								aria-haspopup="dialog"
								className="group/gallery relative block w-full overflow-hidden rounded-xl border border-border bg-muted text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
							>
								<Image
									src={image.src}
									alt={image.alt}
									layout="constrained"
									width={image.width}
									height={image.height}
									sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
									className="h-auto w-full object-cover transition-transform duration-700 group-hover/gallery:scale-[1.04]"
								/>

								<span
									aria-hidden="true"
									className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent"
								/>

								<span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4">
									<Badge
										variant="outline"
										className="border-white/25 bg-black/35 text-[8px] text-white/80 uppercase tracking-[0.16em] backdrop-blur"
									>
										{image.category}
									</Badge>
									<span className="font-semibold text-[13px] text-white leading-snug">
										{image.caption}
									</span>
								</span>

								<span
									aria-hidden="true"
									className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover/gallery:opacity-100 group-focus-visible/gallery:opacity-100"
								>
									<IconMaximize className="size-3.5" stroke={1.75} />
								</span>
							</button>
						</li>
					))}
				</ul>

				<p className="mt-10 text-center text-[10px] text-muted-foreground/70 uppercase tracking-[0.16em]">
					Preview imagery sourced from{' '}
					<a
						href="https://unsplash.com"
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary transition-colors hover:text-primary/80"
					>
						Unsplash
					</a>
				</p>
			</div>

			<GalleryLightbox
				images={visibleImages}
				index={activeIndex}
				onIndexChange={setActiveIndex}
				onClose={() => setActiveIndex(null)}
			/>
		</section>
	);
}
