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
	IconBrandFacebook,
	IconBrandWhatsapp,
	IconBrandX,
	IconCalendarEvent,
	IconClock,
	IconCopy,
	IconEyeOff,
	IconUser,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { FinalCta, Reveal } from "@/components/effects";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { ALL_PROGRAMS } from "@/data/programs";
import { SITE_URL } from "@/data/site";
import { formatLongDate } from "@/lib/date";
import { stringifyJsonLd } from "@/lib/jsonld";
import { useCopyToClipboard } from "@/lib/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/blog.$slug";

/** Null-safe wrapper — posts may be unpublished (no date yet). */
function formatPostDate(iso: string | null): string | null {
	return iso ? formatLongDate(iso) : null;
}

export function PostDetailPage() {
	const { post, isPreview, relatedPosts } = Route.useLoaderData();
	const url = `${SITE_URL}/blog/${post.slug}`;

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
		...(post.coverImageUrl ? { image: [post.coverImageUrl] } : {}),
		...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
		dateModified: post.updatedAt,
		author: {
			"@type": "Person",
			name: post.authorName || "Unicorn Barber Training Academy",
		},
		publisher: {
			"@type": "EducationalOrganization",
			name: "Unicorn Barber Training Academy",
			sameAs: SITE_URL,
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
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(blogPostingJsonLd) }}
			/>
			{faqJsonLd ? (
				<script
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
					dangerouslySetInnerHTML={{ __html: stringifyJsonLd(faqJsonLd) }}
				/>
			) : null}

			{/* Draft-preview banner — admins only, always paired with noindex */}
			{isPreview ? (
				<div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-semibold tracking-wide text-black uppercase">
					<IconEyeOff className="h-4 w-4" />
					Draft preview — not public, excluded from search engines
				</div>
			) : null}

			<article className="bg-background">
				{/* ----------------------------- Header ----------------------------- */}
				<header className="border-b border-border px-6 pt-28 pb-12 lg:px-10 lg:pt-36">
					<Reveal className="mx-auto max-w-3xl">
						<nav
							aria-label="Breadcrumb"
							className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.22em] text-muted-foreground"
						>
							<Link to="/" className="hover:text-primary">
								HOME
							</Link>
							<span aria-hidden="true">/</span>
							<Link to="/blog" className="hover:text-primary">
								JOURNAL
							</Link>
						</nav>

						<div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] tracking-wide text-muted-foreground uppercase">
							{post.category ? (
								<span className="text-primary">{post.category.name}</span>
							) : null}
							{formatPostDate(post.publishedAt) ? (
								<span className="flex items-center gap-1">
									<IconCalendarEvent className="h-3 w-3" />
									<time dateTime={post.publishedAt ?? undefined}>
										{formatPostDate(post.publishedAt)}
									</time>
								</span>
							) : null}
							<span className="flex items-center gap-1">
								<IconClock className="h-3 w-3" />
								{post.readingMinutes} min read
							</span>
							{post.authorName ? (
								<span className="flex items-center gap-1 normal-case">
									<IconUser className="h-3 w-3" />
									{post.authorName}
								</span>
							) : null}
						</div>

						<h1 className="mt-4 font-heading text-3xl leading-tight font-medium text-foreground sm:text-5xl">
							{post.title}
						</h1>
						{post.excerpt ? (
							<p className="mt-5 text-lg leading-relaxed text-secondary-foreground/80">
								{post.excerpt}
							</p>
						) : null}

						{post.tags.length > 0 ? (
							<p className="mt-6 flex flex-wrap gap-1.5">
								{post.tags.map((tag) => (
									<Link
										key={tag}
										to="/blog"
										search={{ page: undefined }}
										className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-primary"
									>
										#{tag}
									</Link>
								))}
							</p>
						) : null}

						<div className="mt-6 flex items-center gap-2">
							<span className="text-[11px] tracking-wide text-muted-foreground uppercase">
								Share
							</span>
							<a
								href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${url}`)}`}
								target="_blank"
								rel="noreferrer"
								aria-label="Share on WhatsApp"
								className={cn(
									buttonVariants({ variant: "outline", size: "icon" }),
									"h-8 w-8",
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
									"h-8 w-8",
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
									"h-8 w-8",
								)}
							>
								<IconBrandX className="h-4 w-4" stroke={1.75} />
							</a>
							<ShareLinkButton url={url} />
						</div>
					</Reveal>
				</header>

				{/* ----------------------------- Cover ------------------------------ */}
				{post.coverImageUrl ? (
					<div className="mx-auto max-w-5xl px-6 pt-10 lg:px-10">
						<img
							src={post.coverImageUrl}
							alt={post.coverImageAlt || post.title}
							className="aspect-[21/9] w-full rounded-2xl border border-border object-cover"
						/>
					</div>
				) : null}

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
				<div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
					<div
						className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: server-rendered via marked + sanitize-html before storage/serialization
						dangerouslySetInnerHTML={{ __html: post.html }}
					/>
				</div>

				{/* --------------------------- Read next ---------------------------- */}
				{relatedPosts.length > 0 ? (
					<nav
						aria-label="Related articles"
						className="mx-auto max-w-3xl px-6 pb-8 lg:px-10"
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
										className="flex h-full flex-col rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
									>
										<span className="line-clamp-3 text-sm leading-snug font-medium">
											{related.title}
										</span>
										{related.publishedAt ? (
											<time
												dateTime={related.publishedAt}
												className="mt-auto pt-2 text-[11px] tracking-wide text-muted-foreground uppercase"
											>
												{formatPostDate(related.publishedAt)}
											</time>
										) : null}
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
						className="mx-auto max-w-3xl px-6 pb-8 lg:px-10"
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

				{/* ------------------------ Related programs -------------------------- */}
				{relatedPrograms.length > 0 ? (
					<section className="mx-auto max-w-3xl px-6 pb-16 lg:px-10">
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

				<p className="mx-auto max-w-3xl px-6 pb-20 lg:px-10">
					<Link
						to="/blog"
						className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-primary hover:underline"
					>
						<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} /> BACK TO THE
						JOURNAL
					</Link>
				</p>
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

function ShareLinkButton({ url }: { url: string }) {
	const { copied, copy } = useCopyToClipboard();
	return (
		<button
			type="button"
			onClick={() => copy(url)}
			aria-label={copied ? "Copied!" : "Copy link"}
			className={cn(
				buttonVariants({ variant: "outline", size: "icon" }),
				"h-8 w-8",
			)}
		>
			<IconCopy className="h-4 w-4" stroke={1.75} />
		</button>
	);
}
