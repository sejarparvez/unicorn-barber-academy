import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { FinalCta, Reveal, SectionEyebrow } from "@/components/site/decor";
import {
	GALLERY_ITEMS,
	type GalleryCategory,
	type GalleryItem,
	pic,
	SITE_URL,
} from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
	component: GalleryPage,
	head: () => ({
		meta: [
			{ title: "Gallery | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"See the work: before-and-after transformations, studio sessions, and graduation days from Unicorn Barber Training Academy in Dhaka.",
			},
			{
				property: "og:title",
				content: "Gallery | Unicorn Barber Training Academy",
			},
			{
				property: "og:description",
				content:
					"Before-and-after transformations and studio life from Unicorn Barber Training Academy.",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/gallery` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/gallery` }],
	}),
});

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

function GalleryPage() {
	return (
		<main>
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
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
		setSelected(null);
	}, []);

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

				<div
					role="tablist"
					aria-label="Filter gallery by category"
					className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-b border-border"
				>
					{FILTERS.map((f) => (
						<button
							key={f.key}
							type="button"
							role="tab"
							aria-selected={active === f.key}
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
				</div>

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
								<img
									src={pic(item.seed, item.w, item.h)}
									alt={item.alt}
									loading="lazy"
									className="w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
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

	return (
		<AnimatePresence>
			{open && item && (
				<motion.div
					role="dialog"
					aria-modal="true"
					aria-label={item.alt}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 px-6 py-10"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onClick={onClose}
				>
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
						onClick={(e) => {
							e.stopPropagation();
							// biome-ignore lint/style/noNonNullAssertion: this is fine
							onNavigate((index! - 1 + items.length) % items.length);
						}}
						aria-label="Previous image"
						className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-primary hover:text-primary sm:left-8"
					>
						<IconChevronLeft className="h-5 w-5" stroke={1.75} />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							// biome-ignore lint/style/noNonNullAssertion: this is fine
							onNavigate((index! + 1) % items.length);
						}}
						aria-label="Next image"
						className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/20 text-white/80 transition-colors hover:border-primary hover:text-primary sm:right-8"
					>
						<IconChevronRight className="h-5 w-5" stroke={1.75} />
					</button>

					<motion.figure
						key={item.id}
						className="flex max-h-full max-w-3xl flex-col items-center"
						initial={{ opacity: 0, scale: 0.96 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={pic(item.seed, item.w * 2, item.h * 2)}
							alt={item.alt}
							className="max-h-[75vh] w-auto object-contain"
						/>
						<figcaption className="mt-4 flex items-center gap-3 text-[12px] tracking-[0.08em] text-white/60">
							<span>{item.alt}</span>
							<span className="h-1 w-1 rounded-full bg-primary/60" />
							<span>
								{/** biome-ignore lint/style/noNonNullAssertion: this is fine */}
								{index! + 1} / {items.length}
							</span>
						</figcaption>
					</motion.figure>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
