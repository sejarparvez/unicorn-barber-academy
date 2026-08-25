// src/features/gallery/gallery-page.tsx
import { Dialog } from "@base-ui/react/dialog";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { Image } from "@unpic/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { FinalCta, Reveal, SectionEyebrow } from "@/components/effects";
import {
	GALLERY_ITEMS,
	type GalleryCategory,
	type GalleryItem,
} from "@/data/gallery";
import { pic } from "@/data/images";
import { SITE_URL } from "@/data/site";
import { stringifyJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

const JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Gallery",
			item: `${SITE_URL}/gallery`,
		},
	],
};

export function GalleryPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(JSON_LD) }}
			/>
			<MasonryGallery />
			<FinalCta
				title="Your before-and-after"
				accent="starts with an application."
				subtitle="Every photo here started the same way yours would — an enrollment form and a first day in the studio."
			/>
		</main>
	);
}

/* --------------------------- Masonry gallery --------------------------- */

const FILTERS: { key: "all" | GalleryCategory; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "barbering", label: "Barbering" },
	{ key: "beauty", label: "Beauty & Cosmetology" },
	{ key: "studio", label: "Studio Life" },
	{ key: "graduation", label: "Graduation Day" },
];

function MasonryGallery() {
	const [active, setActive] = useState<"all" | GalleryCategory>("all");
	const [selected, setSelected] = useState<number | null>(null);
	const shouldReduceMotion = useReducedMotion();

	const visible = useMemo(
		() =>
			active === "all"
				? GALLERY_ITEMS
				: GALLERY_ITEMS.filter((g) => g.category === active),
		[active],
	);

	useEffect(() => {
		if (selected === null) return;
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelected(null);
			if (e.key === "ArrowRight")
				setSelected((s) => (s === null ? s : (s + 1) % visible.length));
			if (e.key === "ArrowLeft")
				setSelected((s) =>
					s === null ? s : (s - 1 + visible.length) % visible.length,
				);
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [selected, visible.length]);

	return (
		<section
			className="border-t border-border bg-muted/40 px-6 py-24 lg:px-10"
			aria-labelledby="gallery-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="2"
					title="Studio & Cohort Life"
					id="gallery-heading"
				/>

				<fieldset className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-border p-0 m-0">
					<legend className="sr-only">Filter gallery by category</legend>
					{FILTERS.map((f) => (
						<button
							key={f.key}
							type="button"
							aria-pressed={active === f.key}
							onClick={() => setActive(f.key)}
							className={cn(
								"relative pb-4 text-[13px] font-medium tracking-widest transition-colors",
								active === f.key
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{f.label.toUpperCase()}
							{active === f.key && (
								<motion.span
									layoutId="gallery-tab-underline"
									className="absolute inset-x-0 -bottom-px h-0.5 bg-primary"
									transition={
										shouldReduceMotion
											? { duration: 0 }
											: { type: "spring", stiffness: 380, damping: 32 }
									}
								/>
							)}
						</button>
					))}
				</fieldset>

				<div className="mt-10 columns-2 gap-4 sm:columns-3 lg:columns-4">
					{visible.map((item, i) => (
						<Reveal
							key={item.id}
							delay={(i % 8) * 0.04}
							className="mb-4 break-inside-avoid"
						>
							<button
								type="button"
								onClick={() => setSelected(i)}
								className="group relative block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary"
							>
								<Image
									src={pic(item.seed, item.w, item.h)}
									alt={item.alt}
									width={item.w}
									height={item.h}
									loading="lazy"
									className="h-auto w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
								/>
								<div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-secondary/10" />
							</button>
						</Reveal>
					))}
				</div>

				{visible.length === 0 && (
					<p className="mt-10 text-sm text-muted-foreground">
						No photos in this category yet.
					</p>
				)}
			</div>

			<Lightbox
				items={visible}
				index={selected}
				onClose={() => setSelected(null)}
				onNavigate={setSelected}
			/>
		</section>
	);
}

/* ------------------------------- Lightbox ------------------------------- */

function Lightbox({
	items,
	index,
	onClose,
	onNavigate,
}: {
	items: GalleryItem[];
	index: number | null;
	onClose: () => void;
	onNavigate: (i: number) => void;
}) {
	const open = index !== null;
	const item = open ? items[index] : null;
	const shouldReduceMotion = useReducedMotion();

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/92 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10 outline-none transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0">
					{open && item && (
						<>
							<Dialog.Title className="sr-only">{item.alt}</Dialog.Title>

							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-primary hover:text-primary"
							>
								<IconX className="h-5 w-5" stroke={1.75} />
							</button>

							<button
								type="button"
								onClick={() =>
									onNavigate(
										// biome-ignore lint/style/noNonNullAssertion: open guarantees index is set
										(index! - 1 + items.length) % items.length,
									)
								}
								aria-label="Previous image"
								className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-primary hover:text-primary sm:left-8"
							>
								<IconChevronLeft className="h-5 w-5" stroke={1.75} />
							</button>
							<button
								type="button"
								onClick={() =>
									onNavigate(
										// biome-ignore lint/style/noNonNullAssertion: open guarantees index is set
										(index! + 1) % items.length,
									)
								}
								aria-label="Next image"
								className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-primary hover:text-primary sm:right-8"
							>
								<IconChevronRight className="h-5 w-5" stroke={1.75} />
							</button>

							<motion.figure
								key={item.id}
								className="flex max-h-full max-w-3xl flex-col items-center"
								initial={
									shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }
								}
								animate={{ opacity: 1, scale: 1 }}
								transition={{
									duration: shouldReduceMotion ? 0 : 0.25,
									ease: [0.16, 1, 0.3, 1],
								}}
							>
								<img
									src={pic(item.seed, item.w * 2, item.h * 2)}
									alt={item.alt}
									decoding="async"
									className="max-h-[75vh] w-auto object-contain"
								/>
								<figcaption className="mt-4 flex items-center gap-3 text-[12px] tracking-[0.08em] text-white/60">
									<span>{item.alt}</span>
									<span className="h-1 w-1 rounded-full bg-primary/60" />
									<span>
										{
											// biome-ignore lint/style/noNonNullAssertion: open guarantees index is set
											index! + 1
										}{" "}
										/ {items.length}
									</span>
								</figcaption>
							</motion.figure>
						</>
					)}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
