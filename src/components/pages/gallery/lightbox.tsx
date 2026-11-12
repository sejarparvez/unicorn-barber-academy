import { Dialog } from '@base-ui/react/dialog';
import {
	IconArrowUpRight,
	IconChevronLeft,
	IconChevronRight,
	IconX,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import type { ProgramOption } from '@/components/pages/programs/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GalleryImage } from '@/data/gallery';

type GalleryLightboxProps = {
	images: GalleryImage[];
	programs: ProgramOption[];
	index: number | null;
	onIndexChange: (index: number) => void;
	onClose: () => void;
};

export default function GalleryLightbox({
	images,
	programs,
	index,
	onIndexChange,
	onClose,
}: GalleryLightboxProps) {
	const image = index === null ? undefined : images[index];
	const hasMultiple = images.length > 1;
	const program = image?.programSlug
		? programs.find((item) => item.slug === image.programSlug)
		: undefined;

	const goTo = (direction: number) => {
		if (index === null || images.length === 0) {
			return;
		}

		onIndexChange((index + direction + images.length) % images.length);
	};

	return (
		<Dialog.Root
			open={image !== undefined}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onClose();
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />

				{image && (
					<Dialog.Popup
						className="fixed inset-0 z-[60] flex flex-col outline-none"
						onKeyDown={(event) => {
							if (event.key === 'ArrowLeft') {
								event.preventDefault();
								goTo(-1);
							}
							if (event.key === 'ArrowRight') {
								event.preventDefault();
								goTo(1);
							}
						}}
					>
						<header className="flex items-start justify-between gap-4 px-4 py-4 sm:px-8 sm:py-6">
							<div className="min-w-0">
								<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
									From the floor
								</p>
								<Dialog.Title className="mt-1 truncate font-semibold text-lg text-foreground tracking-tight sm:text-xl">
									{image.caption}
								</Dialog.Title>
								<Dialog.Description className="sr-only">
									{image.alt}
								</Dialog.Description>
							</div>

							<Dialog.Close
								render={
									<Button
										variant="outline"
										size="icon"
										className="shrink-0 border-border/70 bg-background/60 backdrop-blur"
									/>
								}
							>
								<IconX className="size-4" stroke={1.75} />
								<span className="sr-only">Close gallery</span>
							</Dialog.Close>
						</header>

						<div className="relative flex min-h-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-5 sm:px-6">
							{hasMultiple && (
								<Button
									type="button"
									variant="outline"
									size="icon-lg"
									onClick={() => goTo(-1)}
									aria-label="Previous image"
									className="shrink-0 rounded-full border-border/70 bg-background/70 backdrop-blur hover:bg-primary hover:text-primary-foreground"
								>
									<IconChevronLeft className="size-5" stroke={1.75} />
								</Button>
							)}

							<Image
								key={image.id}
								src={image.src}
								alt={image.alt}
								layout="constrained"
								width={image.width}
								height={image.height}
								sizes="(min-width: 1024px) 76vw, 100vw"
								priority
								unstyled
								className="max-h-[min(72vh,820px)] w-auto max-w-full rounded-xl border border-white/10 object-contain shadow-2xl shadow-black/60"
							/>

							{hasMultiple && (
								<Button
									type="button"
									variant="outline"
									size="icon-lg"
									onClick={() => goTo(1)}
									aria-label="Next image"
									className="shrink-0 rounded-full border-border/70 bg-background/70 backdrop-blur hover:bg-primary hover:text-primary-foreground"
								>
									<IconChevronRight className="size-5" stroke={1.75} />
								</Button>
							)}
						</div>

						<footer className="flex flex-col gap-3 border-border/60 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
							<div className="flex min-w-0 items-center gap-3">
								<Badge
									variant="outline"
									className="shrink-0 border-primary/30 text-[9px] text-primary uppercase tracking-[0.16em]"
								>
									{image.category}
								</Badge>
								<p className="truncate text-muted-foreground text-xs">
									{image.alt}
								</p>
							</div>

							<div className="flex shrink-0 items-center justify-between gap-5 sm:justify-end">
								<span className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
									{String((index ?? 0) + 1).padStart(2, '0')} /{' '}
									{String(images.length).padStart(2, '0')}
								</span>

								{image.programSlug ? (
									<Link
										to="/programs/$slug"
										params={{ slug: image.programSlug }}
										className="group inline-flex items-center gap-1.5 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]"
									>
										{program?.title ?? 'Explore the program'}
										<IconArrowUpRight
											className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
											stroke={1.75}
										/>
									</Link>
								) : (
									<Link
										to="/programs"
										className="group inline-flex items-center gap-1.5 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]"
									>
										Explore programs
										<IconArrowUpRight
											className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
											stroke={1.75}
										/>
									</Link>
								)}
							</div>
						</footer>
					</Dialog.Popup>
				)}
			</Dialog.Portal>
		</Dialog.Root>
	);
}
