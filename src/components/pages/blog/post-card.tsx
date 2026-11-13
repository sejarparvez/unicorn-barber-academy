import { IconCalendar, IconClock } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import {
	formatPostDate,
	POST_CATEGORY_LABELS,
	type PostSummary,
} from '@/components/pages/blog/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Shared listing card for the blog index and the related-posts strip. */
export function PostCard({
	post,
	eager,
}: {
	post: PostSummary;
	eager?: boolean;
}) {
	return (
		<article className="group flex flex-col">
			<Link
				to="/blog/$slug"
				params={{ slug: post.slug }}
				className="relative overflow-hidden rounded-2xl border border-border bg-muted/40"
			>
				{post.coverImage ? (
					<img
						src={post.coverImage}
						alt={post.coverImageAlt || post.title}
						loading={eager ? 'eager' : 'lazy'}
						decoding="async"
						className="aspect-16/10 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
					/>
				) : (
					<span className="flex aspect-16/10 w-full items-center justify-center bg-linear-to-br from-primary/15 via-muted to-muted font-heading text-sm text-primary/70 tracking-[0.28em]">
						UNICORN
					</span>
				)}

				{post.featured ? (
					<Badge
						variant="outline"
						className="absolute top-3 left-3 border-primary/40 bg-background/85 text-[9px] text-primary uppercase tracking-[0.16em] backdrop-blur"
					>
						Featured
					</Badge>
				) : null}
			</Link>

			<div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
				<span className="font-medium text-primary">
					{POST_CATEGORY_LABELS[post.category]}
				</span>
				{post.publishedAt ? (
					<span className="flex items-center gap-1">
						<IconCalendar className="size-3.5" stroke={1.75} aria-hidden />
						<time dateTime={post.publishedAt}>
							{formatPostDate(post.publishedAt)}
						</time>
					</span>
				) : null}
				<span className="flex items-center gap-1">
					<IconClock className="size-3.5" stroke={1.75} aria-hidden />
					{post.readingMinutes} min read
				</span>
			</div>

			<h2 className="mt-2 text-balance font-semibold text-xl leading-snug">
				<Link
					to="/blog/$slug"
					params={{ slug: post.slug }}
					className="transition-colors hover:text-primary"
				>
					{post.title}
				</Link>
			</h2>

			{post.excerpt ? (
				<p className="mt-2 line-clamp-3 text-pretty text-muted-foreground text-sm leading-relaxed">
					{post.excerpt}
				</p>
			) : null}

			{post.tags.length > 0 ? (
				<ul className="mt-3 flex flex-wrap gap-1.5">
					{post.tags.slice(0, 3).map((tag) => (
						<li
							key={tag}
							className={cn(
								'rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground',
							)}
						>
							{tag}
						</li>
					))}
				</ul>
			) : null}
		</article>
	);
}
