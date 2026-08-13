import {
	IconArrowRight,
	IconArrowsHorizontal,
	IconChevronLeft,
	IconChevronRight,
	IconX,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import {
	FinalCta,
	GOLD_TEXT,
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import {
	GALLERY_ITEMS,
	type GalleryCategory,
	type GalleryItem,
	pic,
	SITE_URL,
	TRANSFORMATIONS,
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
				dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
			/>
			<GalleryHero />
			<Transformations />
			<MasonryGallery />
			<FinalCta
				title="Your before-and-after"
				accent="starts with an application."
				subtitle="Every photo here started the same way yours would — an enrollment form and a first day in the studio."
			/>
		</main>
	);
}

/* ----------------------------- Hero ----------------------------- */

function GalleryHero() {
	const shouldReduceMotion = useReducedMotion();
	const fadeUp = (delay = 0) =>
		shouldReduceMotion
			? {}
			: {
					initial: { opacity: 0, y: 18 },
					animate: { opacity: 1, y: 0 },
					transition: {
						duration: 0.7,
						delay,
						ease: [0.16, 1, 0.3, 1] as const,
					},
				};

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 grid grid-cols-3">
				<img
					src={pic("unicorn-gallery-hero-1", 700, 1100)}
					alt=""
					className="h-full w-full object-cover opacity-40"
				/>
				<img
					src={pic("unicorn-gallery-hero-2", 700, 1100)}
					alt=""
					className="hidden h-full w-full object-cover opacity-40 sm:block"
				/>
				<img
					src={pic("unicorn-gallery-hero-3", 700, 1100)}
					alt=""
					className="hidden h-full w-full object-cover opacity-40 lg:block"
				/>
			</div>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(60% 65% at 50% 42%, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.8) 45%, rgba(8,8,8,0.55) 78%, rgba(8,8,8,0.34) 100%)",
				}}
			/>
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<Link to="/" className="hover:text-primary">
						HOME
					</Link>
					<span aria-hidden="true">/</span>
					<span className="text-primary">GALLERY</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					The work{" "}
					<span className={cn("italic font-normal", GOLD_TEXT)}>speaks.</span>
				</motion.h1>
				<motion.p
					{...fadeUp(0.18)}
					className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-secondary-foreground/70 sm:text-lg"
				>
					Real transformations, real studio sessions, real graduation days —
					drag the slider below to see what a cohort produces.
				</motion.p>
			</div>
		</section>
	);
}

/* ------------------------- Before / After ------------------------- */
/* The signature element for this page: an interactive comparison
   slider, because before-and-after is literally how this industry
   presents its work — not a decorative flourish borrowed from
   elsewhere. Built on a native range input so it stays keyboard- and
   screen-reader-operable without custom drag logic. */

function Transformations() {
	return (
		<section
			className="bg-background px-6 py-24 lg:px-10"
			aria-labelledby="transformations-heading"
		>
			<div className="mx-auto max-w-7xl">
				<SectionEyebrow
					guard="1"
					title="Before & After"
					id="transformations-heading"
				/>
				<p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
					Drag the divider, or focus it and use your arrow keys.
				</p>
				<div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
					{TRANSFORMATIONS.map((t, i) => (
						<Reveal key={t.id} delay={i * 0.08}>
							<BeforeAfterSlider
								before={t.before}
								after={t.after}
								alt={t.title}
							/>
							<div className="mt-4 flex items-center justify-between gap-3">
								<h3 className="text-base font-semibold text-foreground">
									{t.title}
								</h3>
								<Link
									to={t.to}
									className="group inline-flex shrink-0 items-center gap-1 text-[12px] font-medium tracking-[0.08em] text-primary"
								>
									{t.program.toUpperCase()}
									<IconArrowRight
										className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
										stroke={1.75}
									/>
								</Link>
							</div>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}

function BeforeAfterSlider({
	before,
	after,
	alt,
}: {
	before: string;
	after: string;
	alt: string;
}) {
	const [value, setValue] = useState(50);

	return (
		<div className="relative aspect-[4/5] select-none overflow-hidden bg-secondary">
			<img
				src={after}
				alt={`${alt} — after`}
				draggable={false}
				className="absolute inset-0 h-full w-full object-cover"
			/>
			<div
				className="absolute inset-0 overflow-hidden"
				style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
			>
				<img
					src={before}
					alt={`${alt} — before`}
					draggable={false}
					className="h-full w-full object-cover"
				/>
			</div>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-y-0 flex -translate-x-1/2 flex-col items-center"
				style={{ left: `${value}%` }}
			>
				<div className="h-full w-px bg-primary" />
				<div className="absolute top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-primary bg-secondary text-primary">
					<IconArrowsHorizontal className="h-4 w-4" stroke={1.75} />
				</div>
			</div>

			<input
				type="range"
				min={0}
				max={100}
				value={value}
				onChange={(e) => setValue(Number(e.target.value))}
				aria-label={`Before and after comparison slider for ${alt}`}
				className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
			/>

			<span className="pointer-events-none absolute bottom-4 left-4 border border-secondary-foreground/30 bg-black/40 px-2 py-1 text-[10px] tracking-[0.14em] text-secondary-foreground backdrop-blur-sm">
				BEFORE
			</span>
			<span className="pointer-events-none absolute bottom-4 right-4 border border-primary/60 bg-black/40 px-2 py-1 text-[10px] tracking-[0.14em] text-primary backdrop-blur-sm">
				AFTER
			</span>
		</div>
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
								"relative pb-4 text-[13px] font-medium tracking-[0.1em] transition-colors",
								active === f.key
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{f.label.toUpperCase()}
							{active === f.key && (
								<motion.span
									layoutId="gallery-tab-underline"
									className="absolute inset-x-0 -bottom-px h-[2px] bg-primary"
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
								className="group relative block w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
								{index! + 1} / {items.length}
							</span>
						</figcaption>
					</motion.figure>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
