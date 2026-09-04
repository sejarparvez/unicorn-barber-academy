// src/features/blog/blog-page.tsx
// Public journal index: paginated grid of published posts. Everything is
// server-rendered so crawlers and AI engines get complete HTML on first
// byte (matches the llms.txt promise). When nothing is published yet this
// degrades to a tasteful "coming soon" instead of an empty shell.
import {
	IconArrowLeft,
	IconArrowRight,
	IconCalendarEvent,
	IconClock,
	IconRss,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { FinalCta, Reveal } from "@/components/effects";
import { SITE_URL } from "@/data/site";
import type { BlogCategory, BlogPostSummary, Paginated } from "@/lib/blog";
import { formatLongDate } from "@/lib/date";
import { stringifyJsonLd } from "@/lib/jsonld";
import { cn } from "@/lib/utils";

/** Null-safe wrapper — scheduled posts may not have a date yet. */
function formatPostDate(iso: string | null): string {
	return iso ? formatLongDate(iso) : "";
}

type Props = {
	posts: Paginated<BlogPostSummary>;
	categories: BlogCategory[];
	page: number;
};

export function BlogPage({ posts, categories, page }: Props) {
	if (posts.items.length === 0) {
		return <BlogComingSoon />;
	}

	const blogJsonLd = {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: "Unicorn Barber Training Academy — The Journal",
		url: `${SITE_URL}/blog`,
		blogPost: posts.items.map((post) => ({
			"@type": "BlogPosting",
			headline: post.title,
			url: `${SITE_URL}/blog/${post.slug}`,
			...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
			...(post.excerpt ? { description: post.excerpt } : {}),
		})),
	};

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
		],
	};

	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(blogJsonLd) }}
			/>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
			/>
			{/* ----------------------------- Hero ----------------------------- */}
			<section className="relative overflow-hidden bg-background px-6 pt-28 pb-14 lg:px-10 lg:pt-36">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="font-mono text-[11px] tracking-[0.32em] text-primary">
						THE JOURNAL
					</p>
					<h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
						Craft, career &amp; the{" "}
						<span className="italic">barber's path.</span>
					</h1>
					<p className="mt-6 text-base leading-relaxed text-secondary-foreground/70">
						Technique breakdowns, career guidance, and behind-the-chair
						perspectives from the instructors at Unicorn Barber Training
						Academy.
					</p>
					{categories.length > 0 ? (
						<nav
							aria-label="Article collections"
							className="mt-8 flex flex-wrap items-center justify-center gap-2"
						>
							{categories.map((category) => (
								<Link
									key={category.id}
									to="/blog/category/$slug"
									params={{ slug: category.slug }}
									className="rounded-full border border-border px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
								>
									{category.name}
								</Link>
							))}
						</nav>
					) : null}
					<a
						href="/feed.xml"
						className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase hover:text-primary"
					>
						<IconRss className="h-3 w-3" stroke={2} />
						Subscribe via RSS
					</a>
				</Reveal>
			</section>

			{/* ----------------------------- Grid ------------------------------ */}
			<section className="bg-background px-6 pb-20 lg:px-10">
				<div className="mx-auto grid max-w-7xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
					{posts.items.map((post) => (
						<BlogPostCard key={post.id} post={post} eager={page === 1} />
					))}
				</div>

				{/* Pagination — real crawlable links */}
				{posts.totalPages > 1 ? (
					<nav
						aria-label="Blog pages"
						className="mx-auto mt-16 flex max-w-7xl items-center justify-between"
					>
						{page > 1 ? (
							<Link
								to="/blog"
								search={{ page: Math.max(1, page - 1) }}
								className="inline-flex items-center gap-2 border border-primary px-5 py-2.5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
							>
								<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} /> NEWER
							</Link>
						) : (
							<span />
						)}
						<span className="text-xs tracking-widest text-muted-foreground">
							PAGE {page} / {posts.totalPages}
						</span>
						{page < posts.totalPages ? (
							<Link
								to="/blog"
								search={{ page: page + 1 }}
								className="inline-flex items-center gap-2 border border-primary px-5 py-2.5 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
							>
								OLDER <IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
							</Link>
						) : (
							<span />
						)}
					</nav>
				) : null}
			</section>

			<FinalCta
				title="Ready to write your own story —"
				accent="in the chair?"
				subtitle="Seats in the next cohort are limited to keep instructor time one-on-one."
			/>
		</main>
	);
}

/** Zero published posts → keep the nav link landing somewhere useful. */
function BlogComingSoon() {
	return (
		<main>
			<section className="relative overflow-hidden bg-background px-6 py-28 lg:px-10">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="font-mono text-[11px] tracking-[0.32em] text-primary">
						THE JOURNAL
					</p>
					<h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
						Articles are <span className="italic">on the way.</span>
					</h1>
					<p className="mt-6 text-base leading-relaxed text-secondary-foreground/70">
						We&rsquo;re writing about fade technique, razor discipline, building
						a client book, and what it takes to go from student to chair-ready
						professional. Check back soon — or start training with us in the
						meantime.
					</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
						<Link
							to="/programs"
							className={cn(
								"inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground",
							)}
						>
							BROWSE PROGRAMS
							<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
						</Link>
					</div>
				</Reveal>
			</section>
			<FinalCta
				title="Don't just read about it —"
				accent="learn it."
				subtitle="Seats in the next cohort are limited to keep instructor time one-on-one."
			/>
		</main>
	);
}

/**
 * Shared listing card � used by the journal index and category archives so
 * both surfaces stay visually identical for crawlers and readers.
 */
export function BlogPostCard({
	post,
	eager,
}: {
	post: BlogPostSummary;
	eager?: boolean;
}) {
	return (
		<article className="group flex flex-col">
			<Link
				to="/blog/$slug"
				params={{ slug: post.slug }}
				className="overflow-hidden rounded-xl border border-border"
			>
				{post.coverImageUrl ? (
					<img
						src={post.coverImageUrl}
						alt={post.coverImageAlt || post.title}
						loading={eager ? "eager" : "lazy"}
						className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
					/>
				) : (
					<div className="flex aspect-[16/10] w-full items-center justify-center bg-muted/40 font-heading text-3xl text-muted-foreground/40">
						UNICORN
					</div>
				)}
			</Link>
			<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] tracking-wide text-muted-foreground uppercase">
				{post.category ? (
					<Link
						to="/blog/category/$slug"
						params={{ slug: post.category.slug }}
						className="text-primary hover:underline"
					>
						{post.category.name}
					</Link>
				) : null}
				{post.publishedAt ? (
					<span className="flex items-center gap-1">
						<IconCalendarEvent className="h-3 w-3" />
						<time dateTime={post.publishedAt}>
							{formatPostDate(post.publishedAt)}
						</time>
					</span>
				) : null}
				<span className="flex items-center gap-1">
					<IconClock className="h-3 w-3" />
					{post.readingMinutes} min read
				</span>
			</div>
			<h2 className="mt-2 font-heading text-xl leading-snug font-medium text-foreground">
				<Link
					to="/blog/$slug"
					params={{ slug: post.slug }}
					className="transition-colors hover:text-primary"
				>
					{post.title}
				</Link>
			</h2>
			{post.excerpt ? (
				<p className="mt-2 line-clamp-3 text-sm leading-relaxed text-secondary-foreground/70">
					{post.excerpt}
				</p>
			) : null}
			{post.tags.length > 0 ? (
				<p className="mt-3 flex flex-wrap gap-1.5">
					{post.tags.slice(0, 3).map((tag) => (
						<span
							key={tag}
							className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
						>
							{tag}
						</span>
					))}
				</p>
			) : null}
		</article>
	);
}
