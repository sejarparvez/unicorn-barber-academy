import {
	IconArrowLeft,
	IconCalendar,
	IconChevronRight,
	IconClock,
	IconUser,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { PostCard } from '@/components/pages/blog/post-card';
import {
	formatPostDate,
	POST_CATEGORY_LABELS,
	type PostDetail,
	type PostSummary,
} from '@/components/pages/blog/types';
import Cta from '@/components/pages/home/cta';

export function PostDetailPage({
	post,
	related,
}: {
	post: PostDetail;
	related: PostSummary[];
}) {
	return (
		<main className="section-light flex-1 bg-background">
			<article>
				<header className="relative overflow-hidden border-border/60 border-b">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -top-40 left-1/3 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
					/>

					<div className="relative mx-auto max-w-3xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
						<nav
							aria-label="Breadcrumb"
							className="flex flex-wrap items-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.22em]"
						>
							<Link to="/" className="transition-colors hover:text-primary">
								Home
							</Link>
							<IconChevronRight className="size-3" stroke={1.75} aria-hidden />
							<Link to="/blog" className="transition-colors hover:text-primary">
								Blog
							</Link>
							<IconChevronRight className="size-3" stroke={1.75} aria-hidden />
							<span className="text-primary">
								{POST_CATEGORY_LABELS[post.category]}
							</span>
						</nav>

						<h1 className="mt-8 text-balance font-semibold text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] tracking-tight">
							{post.title}
						</h1>

						<div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground text-sm">
							<span className="flex items-center gap-1.5">
								<IconUser className="size-4" stroke={1.75} aria-hidden />
								{post.authorName}
							</span>
							{post.publishedAt ? (
								<span className="flex items-center gap-1.5">
									<IconCalendar className="size-4" stroke={1.75} aria-hidden />
									<time dateTime={post.publishedAt}>
										{formatPostDate(post.publishedAt)}
									</time>
								</span>
							) : null}
							<span className="flex items-center gap-1.5">
								<IconClock className="size-4" stroke={1.75} aria-hidden />
								{post.readingMinutes} min read
							</span>
						</div>
					</div>
				</header>

				{post.coverImage ? (
					<div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
						<img
							src={post.coverImage}
							alt={post.coverImageAlt || post.title}
							className="aspect-16/9 w-full rounded-2xl border border-border object-cover"
						/>
					</div>
				) : null}

				<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-14">
					{post.excerpt ? (
						<p className="mb-8 border-primary border-l-2 pl-4 text-pretty font-medium text-lg text-muted-foreground italic leading-relaxed">
							{post.excerpt}
						</p>
					) : null}

					<div
						className="article-body"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized server-side in src/server/markdown.ts
						dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
					/>

					{post.tags.length > 0 ? (
						<ul className="mt-10 flex flex-wrap gap-2 border-border border-t pt-6">
							{post.tags.map((tag) => (
								<li
									key={tag}
									className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs"
								>
									{tag}
								</li>
							))}
						</ul>
					) : null}

					<div className="mt-10">
						<Link
							to="/blog"
							className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
						>
							<IconArrowLeft className="size-4" stroke={1.75} aria-hidden />
							Back to all articles
						</Link>
					</div>
				</div>
			</article>

			{related.length > 0 ? (
				<section
					aria-labelledby="related-heading"
					className="border-border/60 border-t bg-muted/20"
				>
					<div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
						<h2
							id="related-heading"
							className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]"
						>
							Keep reading
						</h2>
						<div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
							{related.map((item) => (
								<PostCard key={item.id} post={item} />
							))}
						</div>
					</div>
				</section>
			) : null}

			<Cta />
		</main>
	);
}
