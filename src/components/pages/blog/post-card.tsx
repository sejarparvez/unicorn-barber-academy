import { IconArrowRight, IconCalendar, IconClock } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import {
	formatPostDate,
	POST_CATEGORY_LABELS,
	type PostSummary,
} from '@/components/pages/blog/types';

/**
 * Shared listing card for the blog index and the related-posts strip.
 *
 * The entire card is a single link, so anywhere a reader taps — image, title,
 * excerpt or whitespace — opens the article. Colours come from theme tokens
 * (`card`, `foreground`, `muted-foreground`, `primary`), which the enclosing
 * `.section-light` band remaps for a white background, so nothing relies on
 * dark-mode-only contrast.
 */
export function PostCard({
	post,
	eager,
}: {
	post: PostSummary;
	eager?: boolean;
}) {
	return (
		<article className="group h-full">
			<Link
				to="/blog/$slug"
				params={{ slug: post.slug }}
				className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
			>
				<div className="relative overflow-hidden bg-muted">
					{post.coverImage ? (
						<img
							src={post.coverImage}
							alt={post.coverImageAlt || post.title}
							loading={eager ? 'eager' : 'lazy'}
							decoding="async"
							className="aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<span className="flex aspect-16/10 w-full items-center justify-center bg-linear-to-br from-primary/15 via-muted to-muted font-heading text-sm text-primary/70 tracking-[0.28em]">
							UNICORN
						</span>
					)}

					<span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 font-semibold text-[10px] text-primary uppercase tracking-[0.14em] backdrop-blur">
						{POST_CATEGORY_LABELS[post.category]}
					</span>

					{post.featured ? (
						<span className="absolute top-3 right-3 rounded-full bg-primary px-2.5 py-1 font-semibold text-[10px] text-primary-foreground uppercase tracking-[0.14em]">
							Featured
						</span>
					) : null}
				</div>

				<div className="flex flex-1 flex-col p-5">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
						{post.publishedAt ? (
							<span className="flex items-center gap-1.5">
								<IconCalendar className="size-3.5" stroke={1.75} aria-hidden />
								<time dateTime={post.publishedAt}>
									{formatPostDate(post.publishedAt)}
								</time>
							</span>
						) : null}
						<span className="flex items-center gap-1.5">
							<IconClock className="size-3.5" stroke={1.75} aria-hidden />
							{post.readingMinutes} min read
						</span>
					</div>

					<h2 className="mt-3 text-balance font-semibold text-lg leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-xl">
						{post.title}
					</h2>

					{post.excerpt ? (
						<p className="mt-2 line-clamp-3 text-pretty text-muted-foreground text-sm leading-relaxed">
							{post.excerpt}
						</p>
					) : null}

					<div className="mt-auto flex items-center justify-between gap-3 pt-5">
						{post.tags.length > 0 ? (
							<ul className="flex flex-wrap gap-1.5">
								{post.tags.slice(0, 2).map((tag) => (
									<li
										key={tag}
										className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
									>
										{tag}
									</li>
								))}
							</ul>
						) : (
							<span />
						)}
						<span className="inline-flex shrink-0 items-center gap-1 font-medium text-primary text-sm">
							Read
							<IconArrowRight
								className="size-4 transition-transform duration-300 group-hover:translate-x-1"
								stroke={1.75}
								aria-hidden
							/>
						</span>
					</div>
				</div>
			</Link>
		</article>
	);
}
