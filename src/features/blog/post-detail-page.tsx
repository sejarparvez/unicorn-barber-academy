// src/features/blog/post-detail-page.tsx
// Public article page. Everything below the fold of `head()` is rendered on
// the server from stored markdown so crawlers/LLMs never need JS.
//
// Structured data shipped per post:
//   * BlogPosting   — headline/dates/author/image/keywords (+ about → Course)
//   * BreadcrumbList
//   * FAQPage       — only when the editor added FAQ pairs
import {
	IconArrowLeft,
	IconArrowRight,
	IconBrandFacebook,
	IconBrandWhatsapp,
	IconBrandX,
	IconCopy,
	IconEyeOff,
	IconListNumbers,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FinalCta, Reveal } from "@/components/effects";
import { JsonLdScript } from "@/components/jsonld-script";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { ALL_PROGRAMS } from "@/data/programs";
import { SITE_URL } from "@/data/site";
import { formatLongDate } from "@/lib/date";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/blog.$slug";

/** Null-safe wrapper — posts may be unpublished (no date yet). */
function formatPostDate(iso: string | null): string | null {
	return iso ? formatLongDate(iso) : null;
}

export function PostDetailPage() {
	const { post, isPreview, relatedPosts, adjacent } = Route.useLoaderData();
	const url = `${SITE_URL}/blog/${post.slug}`;
	const showToc = post.toc.length >= 3;
	// Freshness signal for evergreen pillars: show only when the edit date
	// differs from the publish date (day precision avoids noise from
	// same-day typo fixes).
	const publishedDay = post.publishedAt?.slice(0, 10);
	const updatedDay = post.updatedAt?.slice(0, 10);
	const showUpdated =
		Boolean(post.publishedAt) &&
		Boolean(updatedDay) &&
		publishedDay !== updatedDay;

	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
			{
				"@type": "ListItem",
				position: 2,
				name: "Blog",
				item: `${SITE_URL}/blog`,
			},
			{ "@type": "ListItem", position: 3, name: post.title, item: url },
		],
	};

	const blogPostingJsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		...(post.excerpt ? { description: post.excerpt } : {}),
		url,
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		isPartOf: { "@id": `${SITE_URL}/blog#blog` },
		inLanguage: "en",
		...(post.coverImageUrl
			? {
					image: [
						{
							"@type": "ImageObject",
							url: post.coverImageUrl,
							...(post.coverImageAlt ? { caption: post.coverImageAlt } : {}),
						},
					],
				}
			: {}),
		...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
		dateModified: post.updatedAt,
		author: {
			"@type": "Person",
			name: post.authorName || "Unicorn Barber Training Academy",
		},
		publisher: {
			"@id": `${SITE_URL}/#academy`,
		},
		keywords: [post.focusKeyword, ...post.seoKeywords]
			.filter((k): k is string => Boolean(k))
			.join(", "),
		...(post.category ? { articleSection: post.category.name } : {}),
		...(post.keyTakeaways.length > 0
			? { abstract: post.keyTakeaways.join(" ") }
			: {}),
		...(post.relatedProgramSlugs.length > 0
			? {
					about: post.relatedProgramSlugs.flatMap((slug) => {
						const program = ALL_PROGRAMS.find((p) => p.slug === slug);
						return program
							? [
									{
										"@type": "Course",
										name: program.title,
										url: `${SITE_URL}${program.to}`,
									},
								]
							: [];
					}),
				}
			: {}),
	};

	const faqJsonLd =
		post.faq.length > 0 && !isPreview
			? {
					"@context": "https://schema.org",
					"@type": "FAQPage",
					mainEntity: post.faq.map((item) => ({
						"@type": "Question",
						name: item.q,
						acceptedAnswer: { "@type": "Answer", text: item.a },
					})),
				}
			: null;

	const relatedPrograms = post.relatedProgramSlugs.flatMap((slug) => {
		const program = ALL_PROGRAMS.find((p) => p.slug === slug);
		return program ? [program] : [];
	});

	return (
		<main>
			<JsonLdScript data={breadcrumbJsonLd} />
			<JsonLdScript data={blogPostingJsonLd} />
			{faqJsonLd ? <JsonLdScript data={faqJsonLd} /> : null}

			{/* Sticky share rail — very wide screens only, never prints */}
			<ShareRail title={post.title} url={url} />

			{/* Draft-preview banner — admins only, always paired with noindex */}
			{isPreview ? (
				<div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-semibold tracking-wide text-black uppercase">
					<IconEyeOff className="h-4 w-4" />
					Draft preview — not public, excluded from search engines
				</div>
			) : null}

			<article className="bg-background">
				{/* ------------------------- Hero header ------------------------- */}
				<header className="relative overflow-hidden">
					{/* Cover as hero backdrop with scrim for legibility */}
					{post.coverImageUrl ? (
						<>
							<img
								src={post.coverImageUrl}
								alt=""
								aria-hidden="true"
								fetchPriority="high"
								className="absolute inset-0 h-full w-full object-cover object-center"
							/>
							<div
								aria-hidden="true"
								className="absolute inset-0 bg-linear-to-b from-background/85 via-background/60 to-background"
							/>
						</>
					) : null}
					<div className="relative mx-auto max-w-5xl px-6 pt-28 pb-12 lg:px-10 lg:pt-36">
						<Reveal>
							<Link
								to="/blog"
								className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase transition hover:text-primary"
							>
								<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} />
								Journal
							</Link>

							<div className="mt-6 flex flex-wrap items-center gap-3">
								{post.category ? (
									<span className="rounded-full bg-primary px-3.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary-foreground uppercase">
										{post.category.name}
									</span>
								) : null}
								{showUpdated ? (
									<span className="rounded-full border border-primary/50 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
										Updated {formatPostDate(post.updatedAt)}
									</span>
								) : null}
							</div>

							<h1 className="mt-5 max-w-4xl font-heading text-3xl md:text-4xl leading-[1.05] font-medium text-foreground sm:text-6xl">
								{post.title}
							</h1>

							<div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
								<span className="flex items-center gap-2.5">
									<span
										aria-hidden="true"
										className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-heading text-base font-semibold text-primary"
									>
										{(post.authorName || "U").charAt(0).toUpperCase()}
									</span>
									<span className="leading-tight">
										<span className="block text-sm font-medium text-foreground">
											{post.authorName || "Unicorn Barber Training Academy"}
										</span>
										<span className="block text-xs text-muted-foreground">
											{formatPostDate(post.publishedAt) ? (
												<time dateTime={post.publishedAt ?? undefined}>
													{formatPostDate(post.publishedAt)}
												</time>
											) : null}{" "}
											· {post.readingMinutes} min read
										</span>
									</span>
								</span>
								<span
									aria-hidden="true"
									className="hidden h-8 w-px bg-border sm:block"
								/>
								<span className="flex items-center gap-2">
									<a
										href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`}
										target="_blank"
										rel="noreferrer"
										aria-label="Share on WhatsApp"
										className={cn(
											buttonVariants({ variant: "outline", size: "icon" }),
											"h-8 w-8 rounded-full",
										)}
									>
										<IconBrandWhatsapp className="h-4 w-4" stroke={1.75} />
									</a>
									<a
										href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
										target="_blank"
										rel="noreferrer"
										aria-label="Share on Facebook"
										className={cn(
											buttonVariants({ variant: "outline", size: "icon" }),
											"h-8 w-8 rounded-full",
										)}
									>
										<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
									</a>
									<a
										href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
										target="_blank"
										rel="noreferrer"
										aria-label="Share on X"
										className={cn(
											buttonVariants({ variant: "outline", size: "icon" }),
											"h-8 w-8 rounded-full",
										)}
									>
										<IconBrandX className="h-4 w-4" stroke={1.75} />
									</a>
									<ShareLinkButton url={url} rounded />
								</span>
							</div>
						</Reveal>
					</div>
				</header>

				{/* ------------- Article + TOC grid (sidebar on xl) ------------- */}
				<div className="mx-auto max-w-6xl px-6 lg:px-10">
					{/* Quiet tag row at the flow start */}
					{post.tags.length > 0 ? (
						<p className="mx-auto flex max-w-3xl flex-wrap gap-1.5 pt-10">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
								>
									#{tag}
								</span>
							))}
						</p>
					) : null}
					{/* Mobile TOC — bottom sheet trigger */}
					{showToc ? (
						<div className="mx-auto mt-6 max-w-3xl xl:hidden">
							<TocSheet entries={post.toc} />
						</div>
					) : null}

					<div className="xl:grid xl:grid-cols-[minmax(0,1fr)_260px] xl:gap-12">
						<div className="min-w-0">
							{/* --------------------------- Takeaways ---------------------------- */}
							{post.keyTakeaways.length > 0 ? (
								<aside
									aria-label="Key takeaways"
									className="mx-auto mt-10 max-w-3xl rounded-xl border border-primary/30 bg-primary/5 p-6"
								>
									<h2 className="font-heading text-sm font-semibold tracking-[0.14em] text-primary uppercase">
										Key takeaways
									</h2>
									<ul className="mt-3 space-y-2">
										{post.keyTakeaways.map((takeaway) => (
											<li
												key={takeaway}
												className="flex gap-2 text-sm leading-relaxed"
											>
												<span aria-hidden="true" className="text-primary">
													—
												</span>
												{takeaway}
											</li>
										))}
									</ul>
								</aside>
							) : null}

							{/* ----------------------------- Body -------------------------------- */}
							<div className="mx-auto max-w-3xl py-10">
								<div
									className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-h2:scroll-mt-28 prose-a:text-primary"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered via marked + sanitize-html before storage/serialization
									dangerouslySetInnerHTML={{ __html: post.html }}
								/>
							</div>

							{/* --------------------------- Read next ---------------------------- */}
							{relatedPosts.length > 0 ? (
								<nav
									aria-label="Related articles"
									className="mx-auto max-w-3xl pb-8"
								>
									<h2 className="font-heading text-2xl font-medium text-foreground">
										Read next
									</h2>
									<ul className="mt-5 grid gap-3 sm:grid-cols-3">
										{relatedPosts.map((related) => (
											<li key={related.id}>
												<Link
													to="/blog/$slug"
													params={{ slug: related.slug }}
													className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50"
												>
													{related.coverImageUrl ? (
														<img
															src={related.coverImageUrl}
															alt=""
															loading="lazy"
															className="aspect-[16/9] w-full object-cover"
														/>
													) : null}
													<span className="flex flex-1 flex-col p-4">
														{related.category ? (
															<span className="text-[10px] font-semibold tracking-[0.18em] text-primary uppercase">
																{related.category.name}
															</span>
														) : null}
														<span className="mt-1.5 line-clamp-3 text-sm leading-snug font-medium">
															{related.title}
														</span>
														{related.excerpt ? (
															<span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
																{related.excerpt}
															</span>
														) : null}
														<span className="mt-auto flex items-center gap-2 pt-2 text-[11px] tracking-wide text-muted-foreground uppercase">
															{related.publishedAt ? (
																<time dateTime={related.publishedAt}>
																	{formatPostDate(related.publishedAt)}
																</time>
															) : null}
															<span aria-hidden="true">·</span>
															<span>{related.readingMinutes} min</span>
														</span>
													</span>
												</Link>
											</li>
										))}
									</ul>
								</nav>
							) : null}

							{/* ------------------------------ FAQ -------------------------------- */}
							{post.faq.length > 0 ? (
								<section
									aria-label="Frequently asked questions"
									className="mx-auto max-w-3xl pb-8"
								>
									<h2 className="font-heading text-2xl font-medium text-foreground">
										Frequently asked questions
									</h2>
									<Accordion className="mt-6 rounded-xl border border-border bg-card px-5">
										{post.faq.map((item) => (
											<AccordionItem
												key={item.q}
												value={item.q}
												className="border-b last:border-b-0"
											>
												<AccordionTrigger className="py-4 font-medium hover:no-underline [&>svg]:text-primary">
													{item.q}
												</AccordionTrigger>
												<AccordionContent className="pb-4 text-sm leading-relaxed text-secondary-foreground/80">
													{item.a}
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</section>
							) : null}

							{/* ------------------------------ Author ------------------------------ */}
							<div className="mx-auto max-w-3xl pb-8">
								<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
									<span
										aria-hidden="true"
										className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 font-heading text-xl font-semibold text-primary"
									>
										{(post.authorName || "U").charAt(0).toUpperCase()}
									</span>
									<div className="min-w-0">
										<p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
											Written by
										</p>
										<p className="mt-0.5 truncate font-medium text-foreground">
											{post.authorName || "Unicorn Barber Training Academy"}
										</p>
										<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
											Working barbers and beauty professionals training the next
											chairs in Banasree, Dhaka.
										</p>
									</div>
								</div>
							</div>

							{/* ------------------------ Related programs -------------------------- */}
							{relatedPrograms.length > 0 ? (
								<section className="mx-auto max-w-3xl pb-16">
									<h2 className="font-heading text-2xl font-medium text-foreground">
										Learn this hands-on
									</h2>
									<p className="mt-2 text-sm text-muted-foreground">
										The academy runs these as instructor-led cohorts:
									</p>
									<ul className="mt-5 grid gap-3 sm:grid-cols-2">
										{relatedPrograms.map((program) => (
											<li key={program.slug}>
												<Link
													to={program.to}
													className="flex h-full flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/50"
												>
													<span className="font-medium">{program.title}</span>
													<span className="mt-1 text-xs text-muted-foreground">
														{program.duration} · {program.level}
													</span>
												</Link>
											</li>
										))}
									</ul>
								</section>
							) : null}
						</div>

						{/* Desktop TOC — sticky rail with progress + active section */}
						{showToc ? (
							<aside className="hidden min-w-0 xl:block">
								<TocRail entries={post.toc} />
							</aside>
						) : null}
					</div>
				</div>

				{/* ------------------------- Prev / Next ---------------------------- */}
				{adjacent.prev || adjacent.next ? (
					<div className="mx-auto max-w-6xl px-6 lg:px-10">
						<nav aria-label="More articles" className="mx-auto max-w-3xl pb-4">
							<ul className="divide-y divide-border border-y border-border">
								{adjacent.next ? (
									<li className="min-w-0">
										<Link
											to="/blog/$slug"
											params={{ slug: adjacent.next.slug }}
											className="group flex min-w-0 items-center gap-4 py-5"
										>
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
													<span className="font-mono text-primary">01</span>
													Newer article
												</span>
												<span className="mt-1.5 block font-heading text-xl leading-snug font-medium break-words text-foreground transition group-hover:text-primary sm:text-2xl">
													{adjacent.next.title}
												</span>
											</span>
											<span
												aria-hidden="true"
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
											>
												<IconArrowRight
													className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
													stroke={1.75}
												/>
											</span>
										</Link>
									</li>
								) : null}
								{adjacent.prev ? (
									<li className="min-w-0">
										<Link
											to="/blog/$slug"
											params={{ slug: adjacent.prev.slug }}
											className="group flex min-w-0 items-center gap-4 py-5"
										>
											<span
												aria-hidden="true"
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
											>
												<IconArrowLeft
													className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
													stroke={1.75}
												/>
											</span>
											<span className="min-w-0 flex-1">
												<span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
													<span className="font-mono text-primary">02</span>
													Older article
												</span>
												<span className="mt-1.5 block font-heading text-xl leading-snug font-medium break-words text-foreground transition group-hover:text-primary sm:text-2xl">
													{adjacent.prev.title}
												</span>
											</span>
										</Link>
									</li>
								) : null}
							</ul>
						</nav>
					</div>
				) : null}

				<div className="mx-auto max-w-6xl px-6 lg:px-10">
					<p className="mx-auto max-w-3xl pb-20">
						<Link
							to="/blog"
							className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-primary hover:underline"
						>
							<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} /> BACK TO
							THE JOURNAL
						</Link>
					</p>
				</div>
			</article>

			<FinalCta
				title="From reader to professional —"
				accent="train with us."
				subtitle="Small cohorts, working professionals as instructors, job placement support."
			/>
		</main>
	);
}

export function PostNotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-32 text-center">
			<h1 className="font-heading text-3xl font-medium text-foreground">
				Article not found
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				This article may have been moved or unpublished.
			</p>
			<Link
				to="/blog"
				className="mt-8 inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
			>
				BACK TO THE JOURNAL
				<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} />
			</Link>
		</main>
	);
}

/** Fixed vertical share rail for very wide screens (never prints). */
function ShareRail({ title, url }: { title: string; url: string }) {
	return (
		<div
			aria-hidden={false}
			className="fixed top-1/2 left-8 z-30 hidden -translate-y-1/2 flex-col gap-2 min-[1500px]:flex print:hidden"
		>
			<span className="mb-1 text-[10px] items-center justify-center ml-2 font-semibold tracking-[0.22em] text-muted-foreground uppercase [writing-mode:vertical-lr]">
				Share
			</span>
			<a
				href={`https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`}
				target="_blank"
				rel="noreferrer"
				aria-label="Share on WhatsApp"
				className={cn(
					buttonVariants({ variant: "outline", size: "icon" }),
					"h-9 w-9 rounded-full bg-background/80 backdrop-blur",
				)}
			>
				<IconBrandWhatsapp className="h-4 w-4" stroke={1.75} />
			</a>
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
				target="_blank"
				rel="noreferrer"
				aria-label="Share on Facebook"
				className={cn(
					buttonVariants({ variant: "outline", size: "icon" }),
					"h-9 w-9 rounded-full bg-background/80 backdrop-blur",
				)}
			>
				<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
			</a>
			<a
				href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
				target="_blank"
				rel="noreferrer"
				aria-label="Share on X"
				className={cn(
					buttonVariants({ variant: "outline", size: "icon" }),
					"h-9 w-9 rounded-full bg-background/80 backdrop-blur",
				)}
			>
				<IconBrandX className="h-4 w-4" stroke={1.75} />
			</a>
			<ShareLinkButton url={url} rounded />
		</div>
	);
}

type TocEntry = { id: string; text: string };

/** Mobile TOC: sticky trigger opens a bottom sheet with large touch
    targets. Controlled so tapping a link closes the sheet. */
function TocSheet({ entries }: { entries: TocEntry[] }) {
	const [open, setOpen] = useState(false);
	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				className={cn(
					buttonVariants({ variant: "outline" }),
					"w-full justify-between rounded-xl",
				)}
			>
				<span className="text-[12px] font-semibold tracking-[0.16em] uppercase">
					On this page · {entries.length} sections
				</span>
				<IconListNumbers className="h-4 w-4 text-primary" stroke={1.75} />
			</SheetTrigger>
			<SheetContent
				side="bottom"
				className="max-h-[70vh] overflow-auto rounded-t-2xl px-6 pt-4 pb-8"
			>
				<SheetHeader className="px-0 pt-2">
					<SheetTitle className="text-left text-[12px] font-semibold tracking-[0.16em] uppercase">
						On this page
					</SheetTitle>
				</SheetHeader>
				<ul className="mt-2 space-y-1">
					{entries.map((entry, index) => (
						<li key={entry.id}>
							<a
								href={`#${entry.id}`}
								onClick={() => setOpen(false)}
								className="flex items-baseline gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] text-foreground active:bg-muted"
							>
								<span className="font-mono text-xs text-primary">
									{String(index + 1).padStart(2, "0")}
								</span>
								{entry.text}
							</a>
						</li>
					))}
				</ul>
			</SheetContent>
		</Sheet>
	);
}

/** Desktop TOC rail: numbered entries, gold progress fill, active-section
    highlight with reliable auto-scroll. The list lives in a plain
    overflow container with an explicit max height (Base UI ScrollArea
    collapses inside sticky flex layouts, which broke scrolling) plus
    edge fades that hint more content above/below. SSR renders the static
    list; hydration adds the interactivity (no SEO impact). */
function TocRail({ entries }: { entries: TocEntry[] }) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);
	const [canUp, setCanUp] = useState(false);
	const [canDown, setCanDown] = useState(false);
	const listRef = useRef<HTMLDivElement>(null);
	const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
	const activeIndex = entries.findIndex((entry) => entry.id === activeId);

	useEffect(() => {
		const headings = entries
			.map((entry) => document.getElementById(entry.id))
			.filter((el): el is HTMLElement => el !== null);
		if (headings.length === 0) return;
		const observer = new IntersectionObserver(
			(records) => {
				for (const record of records) {
					if (record.isIntersecting) setActiveId(record.target.id);
				}
			},
			{ rootMargin: "-25% 0px -65% 0px" },
		);
		for (const heading of headings) observer.observe(heading);
		return () => observer.disconnect();
	}, [entries]);

	useEffect(() => {
		const onScroll = () => {
			const doc = document.documentElement;
			const max = doc.scrollHeight - window.innerHeight;
			setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const updateEdges = useCallback(() => {
		const el = listRef.current;
		if (!el) return;
		setCanUp(el.scrollTop > 4);
		setCanDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
	}, []);

	useEffect(() => {
		updateEdges();
		window.addEventListener("resize", updateEdges);
		return () => window.removeEventListener("resize", updateEdges);
	}, [updateEdges]);

	// Keep the active entry visible with direct scrollTop math — unlike
	// scrollIntoView, this never scrolls the page itself.
	useEffect(() => {
		if (!activeId) return;
		const container = listRef.current;
		const item = itemRefs.current.get(activeId);
		if (!container || !item) return;
		const top = item.offsetTop;
		const bottom = top + item.offsetHeight;
		if (top < container.scrollTop + 4) {
			container.scrollTop = top - 8;
		} else if (bottom > container.scrollTop + container.clientHeight - 4) {
			container.scrollTop = bottom - container.clientHeight + 8;
		}
		updateEdges();
	}, [activeId, updateEdges]);

	return (
		<nav
			aria-label="Table of contents"
			className="sticky top-24 flex max-h-[calc(100vh-7rem)] min-h-0 flex-col"
		>
			<div className="flex items-baseline justify-between">
				<p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
					On this page
				</p>
				<p
					aria-hidden="true"
					className="font-mono text-[11px] text-muted-foreground"
				>
					{activeIndex >= 0
						? `${String(activeIndex + 1).padStart(2, "0")} / ${String(entries.length).padStart(2, "0")}`
						: `${String(entries.length).padStart(2, "0")} sections`}
				</p>
			</div>
			<div
				aria-hidden="true"
				className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-border"
			>
				<div
					className="h-full rounded-full bg-primary transition-[width]"
					style={{ width: `${Math.round(progress * 100)}%` }}
				/>
			</div>
			<div className="relative mt-2 flex min-h-0 flex-1 flex-col">
				<div
					ref={listRef}
					onScroll={updateEdges}
					className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin] [scrollbar-color:var(--primary)_transparent]"
				>
					<ul className="space-y-1 py-1">
						{entries.map((entry, index) => {
							const active = entry.id === activeId;
							return (
								<li key={entry.id}>
									<a
										ref={(node) => {
											if (node) itemRefs.current.set(entry.id, node);
											else itemRefs.current.delete(entry.id);
										}}
										href={`#${entry.id}`}
										aria-current={active ? "location" : undefined}
										className={cn(
											"group flex items-baseline gap-2.5 rounded-r-lg border-l-2 py-1.5 pl-3 text-[13px] leading-snug transition",
											active
												? "border-primary bg-primary/5 font-medium text-foreground"
												: "border-transparent text-secondary-foreground/70 hover:border-border hover:text-primary",
										)}
									>
										<span
											className={cn(
												"font-mono text-[11px]",
												active ? "text-primary" : "text-muted-foreground",
											)}
										>
											{String(index + 1).padStart(2, "0")}
										</span>
										{entry.text}
									</a>
								</li>
							);
						})}
					</ul>
				</div>
				{/* Edge fades hint scrollable content above/below */}
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-x-0 top-0 h-6 bg-linear-to-b from-background to-transparent transition-opacity",
						canUp ? "opacity-100" : "opacity-0",
					)}
				/>
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-background to-transparent transition-opacity",
						canDown ? "opacity-100" : "opacity-0",
					)}
				/>
			</div>
		</nav>
	);
}

function ShareLinkButton({ url, rounded }: { url: string; rounded?: boolean }) {
	const { copied, copy } = useCopyToClipboard();
	return (
		<button
			type="button"
			onClick={() => copy(url)}
			aria-label={copied ? "Copied!" : "Copy link"}
			className={cn(
				buttonVariants({ variant: "outline", size: "icon" }),
				"h-8 w-8",
				rounded && "rounded-full",
			)}
		>
			<IconCopy className="h-4 w-4" stroke={1.75} />
		</button>
	);
}
