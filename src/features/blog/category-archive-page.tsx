// src/features/blog/category-archive-page.tsx
// Category archive: paginated grid of a single category's published posts.
// Shares BlogPostCard with the journal index so both surfaces stay
// structurally identical for crawlers. Thin archives (< MIN_INDEX_POSTS)
// ship meta robots noindex from the route's head() — this component just
// renders content.
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { FinalCta, Reveal } from "@/components/effects";
import { SITE_URL } from "@/data/site";
import type { BlogCategory, BlogPostSummary, Paginated } from "@/lib/blog";
import { stringifyJsonLd } from "@/lib/jsonld";
import { BlogPostCard } from "./blog-page";

export const CATEGORY_MIN_INDEX_POSTS = 3;

type Props = {
	category: BlogCategory;
	posts: Paginated<BlogPostSummary>;
	page: number;
};

export function CategoryArchivePage({ category, posts, page }: Props) {
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
			{
				"@type": "ListItem",
				position: 3,
				name: category.name,
				item: `${SITE_URL}/blog/category/${category.slug}`,
			},
		],
	};

	return (
		<main>
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: stringifyJsonLd(breadcrumbJsonLd) }}
			/>
			<section className="relative overflow-hidden bg-background px-6 pt-28 pb-14 lg:px-10 lg:pt-36">
				<Reveal className="mx-auto max-w-2xl text-center">
					<p className="font-mono text-[11px] tracking-[0.32em] text-primary">
						THE JOURNAL
					</p>
					<h1 className="mt-4 font-heading text-4xl font-medium text-foreground sm:text-5xl">
						{category.name}
					</h1>
					<p className="mt-6 text-base leading-relaxed text-secondary-foreground/70">
						{posts.total} article{posts.total === 1 ? "" : "s"} in this
						collection.
					</p>
					<p className="mt-4">
						<Link
							to="/blog"
							className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.16em] text-primary hover:underline"
						>
							<IconArrowLeft className="h-3.5 w-3.5" stroke={1.75} /> ALL
							ARTICLES
						</Link>
					</p>
				</Reveal>
			</section>

			<section className="bg-background px-6 pb-20 lg:px-10">
				<div className="mx-auto grid max-w-7xl gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
					{posts.items.map((post) => (
						<BlogPostCard key={post.id} post={post} eager={page === 1} />
					))}
				</div>

				{posts.totalPages > 1 ? (
					<nav
						aria-label="Archive pages"
						className="mx-auto mt-16 flex max-w-7xl items-center justify-between"
					>
						{page > 1 ? (
							<Link
								to="/blog/category/$slug"
								params={{ slug: category.slug }}
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
								to="/blog/category/$slug"
								params={{ slug: category.slug }}
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
