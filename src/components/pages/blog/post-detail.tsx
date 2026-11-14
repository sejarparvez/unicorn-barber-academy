import {
	IconArrowLeft,
	IconCalendar,
	IconChevronRight,
	IconClock,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import Logo from '@/assets/logo/logo.png';
import { BackToTop } from '@/components/pages/blog/back-to-top';
import { PostCard } from '@/components/pages/blog/post-card';
import { PostNavigation } from '@/components/pages/blog/post-navigation';
import { ReadingProgress } from '@/components/pages/blog/reading-progress';
import { ShareButtons } from '@/components/pages/blog/share-buttons';
import {
	MobileTableOfContents,
	TableOfContents,
} from '@/components/pages/blog/table-of-contents';
import {
	extractHeadings,
	formatPostDate,
	POST_CATEGORY_LABELS,
	type PostDetail,
	type PostSummary,
} from '@/components/pages/blog/types';
import Cta from '@/components/pages/home/cta';
import { cn } from '@/lib/utils';

/** Round avatar showing the academy logo, which is gold and needs a dark base. */
function AuthorAvatar({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				'flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground',
				className,
			)}
		>
			<img
				src={Logo}
				alt=""
				aria-hidden="true"
				className="size-9 object-contain"
			/>
		</span>
	);
}

export function PostDetailPage({
	post,
	related,
	newer,
	older,
}: {
	post: PostDetail;
	related: PostSummary[];
	newer: PostSummary | null;
	older: PostSummary | null;
}) {
	const headings = extractHeadings(post.bodyHtml);

	return (
		<main className="section-light flex-1 bg-background">
			<ReadingProgress />

			<article>
				<header className="relative overflow-hidden border-border/60 border-b">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute -top-40 left-1/3 size-128 -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
					/>
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.08] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_top,black_5%,transparent_65%)]"
					/>

					<div className="relative mx-auto max-w-4xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
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

						<div className="mt-8 flex flex-wrap items-center gap-2">
							<Link
								to="/blog"
								search={{ category: post.category }}
								className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-semibold text-[10px] text-primary uppercase tracking-[0.16em] transition-colors hover:bg-primary/20"
							>
								{POST_CATEGORY_LABELS[post.category]}
							</Link>
							{post.featured ? (
								<span className="inline-flex items-center rounded-full border border-primary/40 px-3 py-1 font-semibold text-[10px] text-primary uppercase tracking-[0.16em]">
									Featured
								</span>
							) : null}
						</div>

						<h1 className="mt-5 text-balance font-semibold text-[clamp(2rem,4.5vw,3.25rem)] text-foreground leading-[1.08] tracking-tight">
							{post.title}
						</h1>

						{post.excerpt ? (
							<p className="mt-6 text-pretty font-medium text-lg text-muted-foreground leading-relaxed">
								{post.excerpt}
							</p>
						) : null}

						<div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-border border-t pt-6">
							<div className="flex items-center gap-3">
								<AuthorAvatar />
								<div className="min-w-0">
									<p className="truncate font-medium text-foreground text-sm">
										{post.authorName}
									</p>
									<p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
										{post.publishedAt ? (
											<span className="flex items-center gap-1.5">
												<IconCalendar
													className="size-3.5"
													stroke={1.75}
													aria-hidden
												/>
												<time dateTime={post.publishedAt}>
													{formatPostDate(post.publishedAt)}
												</time>
											</span>
										) : null}
										<span className="flex items-center gap-1.5">
											<IconClock
												className="size-3.5"
												stroke={1.75}
												aria-hidden
											/>
											{post.readingMinutes} min read
										</span>
									</p>
								</div>
							</div>

							<ShareButtons title={post.title} />
						</div>
					</div>
				</header>

				{post.coverImage ? (
					<div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
						<figure>
							<img
								src={post.coverImage}
								alt={post.coverImageAlt || post.title}
								className="aspect-16/9 w-full rounded-2xl border border-border object-cover"
							/>
							{post.coverImageAlt ? (
								<figcaption className="mt-3 text-center text-muted-foreground text-xs">
									{post.coverImageAlt}
								</figcaption>
							) : null}
						</figure>
					</div>
				) : null}

				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10 lg:py-14">
					<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-10">
						<div className="mx-auto w-full max-w-3xl lg:mx-0">
							<div className="lg:hidden">
								<MobileTableOfContents headings={headings} />
							</div>

							<div
								className="article-body"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized server-side in src/server/markdown.ts
								dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
							/>

							{post.tags.length > 0 ? (
								<ul className="mt-10 flex flex-wrap items-center gap-2 border-border border-t pt-6">
									<li className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
										Tags
									</li>
									{post.tags.map((tag) => (
										<li key={tag}>
											<span className="rounded-full border border-border px-3 py-1 text-muted-foreground text-xs">
												#{tag}
											</span>
										</li>
									))}
								</ul>
							) : null}

							<div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
								<p className="font-medium text-foreground text-sm">
									Found this useful? Pass it on.
								</p>
								<ShareButtons title={post.title} />
							</div>

							<PostNavigation newer={newer} older={older} />

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

						<aside className="hidden lg:block">
							<div className="sticky top-24 space-y-8">
								<TableOfContents headings={headings} />

								<div className="rounded-xl border border-border bg-card p-5">
									<AuthorAvatar />
									<p className="mt-3 font-medium text-foreground text-sm">
										{post.authorName}
									</p>
									<p className="mt-1 text-muted-foreground text-xs leading-relaxed">
										Writing from the floor of Unicorn Barber Training Academy.
									</p>
									<Link
										to="/contact"
										className="mt-3 inline-flex items-center gap-1 font-medium text-primary text-xs hover:underline"
									>
										Talk to admissions
										<IconChevronRight
											className="size-3.5"
											stroke={1.75}
											aria-hidden
										/>
									</Link>
								</div>
							</div>
						</aside>
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
						<div className="mt-8 grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{related.map((item) => (
								<PostCard key={item.id} post={item} />
							))}
						</div>
					</div>
				</section>
			) : null}

			<Cta />
			<BackToTop />
		</main>
	);
}
