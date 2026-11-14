import {
	IconArrowLeft,
	IconArrowRight,
	IconCalendar,
	IconChevronRight,
	IconClock,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { PostCard } from '@/components/pages/blog/post-card';
import {
	formatPostDate,
	type PaginatedPosts,
	POST_CATEGORY_LABELS,
	type PostCategory,
	type PostSummary,
} from '@/components/pages/blog/types';
import { SectionHeading } from '@/components/pages/home/section-heading';
import { cn } from '@/lib/utils';

type BlogSearch = { page?: number; category?: PostCategory };

export function BlogIndex({
	posts,
	categoryCounts,
	activeCategory,
	page,
}: {
	posts: PaginatedPosts;
	categoryCounts: { category: PostCategory; count: number }[];
	activeCategory?: PostCategory;
	page: number;
}) {
	const totalPosts = categoryCounts.reduce((sum, item) => sum + item.count, 0);

	// On the unfiltered first page, lift the newest featured post into a wide
	// hero card and flow the rest through the regular grid.
	const featured =
		page === 1 && !activeCategory
			? posts.items.find((post) => post.featured)
			: undefined;
	const gridPosts = featured
		? posts.items.filter((post) => post.id !== featured.id)
		: posts.items;

	return (
		<main className="section-light flex-1 bg-background">
			<section className="relative overflow-hidden border-border/60 border-b">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-40 left-1/3 size-128 -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.08] bg-size-[64px_64px] mask-[radial-gradient(ellipse_at_top,black_5%,transparent_65%)]"
				/>

				<div className="relative mx-auto max-w-7xl px-4 pt-12 pb-14 sm:px-6 lg:px-10 lg:pt-16">
					<nav
						aria-label="Breadcrumb"
						className="flex items-center gap-2 font-medium text-[11px] text-muted-foreground uppercase tracking-[0.22em]"
					>
						<Link to="/" className="transition-colors hover:text-primary">
							Home
						</Link>
						<IconChevronRight className="size-3" stroke={1.75} aria-hidden />
						<span className="text-primary">Blog</span>
					</nav>

					<div className="mt-10">
						<SectionHeading
							id="blog-heading"
							as="h1"
							eyebrow="Journal"
							title={
								<>
									Craft notes from the{' '}
									<span className="text-primary">floor</span>.
								</>
							}
							description="Techniques, tool talk and career advice from the barbers and educators at Unicorn Barber Training Academy."
						/>
					</div>
				</div>
			</section>

			<section
				aria-label="Blog posts"
				className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-16"
			>
				{categoryCounts.length > 0 ? (
					<div className="mb-10 flex flex-wrap gap-2">
						<CategoryChip
							active={!activeCategory}
							to={{ category: undefined }}
							label="All"
							count={totalPosts}
						/>
						{categoryCounts.map(({ category, count }) => (
							<CategoryChip
								key={category}
								active={activeCategory === category}
								to={{ category }}
								label={POST_CATEGORY_LABELS[category]}
								count={count}
							/>
						))}
					</div>
				) : null}

				{posts.items.length === 0 ? (
					<EmptyState />
				) : (
					<>
						{featured ? <FeaturedPost post={featured} /> : null}

						<div
							className={cn(
								'grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3',
								featured && 'mt-8',
							)}
						>
							{gridPosts.map((post) => (
								<PostCard key={post.id} post={post} eager={page === 1} />
							))}
						</div>

						{posts.totalPages > 1 ? (
							<Pagination
								page={page}
								totalPages={posts.totalPages}
								category={activeCategory}
							/>
						) : null}
					</>
				)}
			</section>
		</main>
	);
}

function FeaturedPost({ post }: { post: PostSummary }) {
	return (
		<article className="group">
			<Link
				to="/blog/$slug"
				params={{ slug: post.slug }}
				className="grid overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition duration-300 hover:border-primary/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 md:grid-cols-2"
			>
				<div className="relative overflow-hidden bg-muted">
					{post.coverImage ? (
						<img
							src={post.coverImage}
							alt={post.coverImageAlt || post.title}
							loading="eager"
							decoding="async"
							className="h-full min-h-60 w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					) : (
						<span className="flex h-full min-h-60 w-full items-center justify-center bg-linear-to-br from-primary/15 via-muted to-muted font-heading text-sm text-primary/70 tracking-[0.28em]">
							UNICORN
						</span>
					)}

					<span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 font-semibold text-[10px] text-primary-foreground uppercase tracking-[0.16em]">
						Featured
					</span>
				</div>

				<div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-xs">
						<span className="font-semibold text-primary uppercase tracking-[0.14em]">
							{POST_CATEGORY_LABELS[post.category]}
						</span>
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

					<h2 className="text-balance font-semibold text-2xl leading-tight tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
						{post.title}
					</h2>

					{post.excerpt ? (
						<p className="text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
							{post.excerpt}
						</p>
					) : null}

					<span className="mt-1 inline-flex items-center gap-2 font-medium text-primary text-sm">
						Read the article
						<IconArrowRight
							className="size-4 transition-transform duration-300 group-hover:translate-x-1"
							stroke={1.75}
							aria-hidden
						/>
					</span>
				</div>
			</Link>
		</article>
	);
}

function CategoryChip({
	active,
	to,
	label,
	count,
}: {
	active: boolean;
	to: BlogSearch;
	label: string;
	count: number;
}) {
	return (
		<Link
			to="/blog"
			search={to}
			className={cn(
				'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-semibold text-[10px] uppercase tracking-[0.14em] transition-colors',
				active
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-primary',
			)}
		>
			{label}
			<span
				className={cn(
					'rounded-full px-1.5 py-0.5 font-mono text-[9px]',
					active
						? 'bg-primary-foreground/15 text-primary-foreground'
						: 'bg-muted text-muted-foreground',
				)}
			>
				{count}
			</span>
		</Link>
	);
}

function Pagination({
	page,
	totalPages,
	category,
}: {
	page: number;
	totalPages: number;
	category?: PostCategory;
}) {
	return (
		<nav
			aria-label="Blog pages"
			className="mt-16 flex items-center justify-between gap-4 border-border border-t pt-6"
		>
			{page > 1 ? (
				<Link
					to="/blog"
					search={{ page: Math.max(1, page - 1), category }}
					className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
				>
					<IconArrowLeft className="size-4" stroke={1.75} aria-hidden />
					Newer posts
				</Link>
			) : (
				<span />
			)}

			<span className="text-muted-foreground text-sm">
				Page {page} of {totalPages}
			</span>

			{page < totalPages ? (
				<Link
					to="/blog"
					search={{ page: page + 1, category }}
					className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
				>
					Older posts
					<IconArrowRight className="size-4" stroke={1.75} aria-hidden />
				</Link>
			) : (
				<span />
			)}
		</nav>
	);
}

function EmptyState() {
	return (
		<div className="mx-auto max-w-2xl rounded-2xl border border-border border-dashed bg-muted/20 px-6 py-16 text-center">
			<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
				Coming soon
			</p>
			<h2 className="mt-4 text-primary font-semibold text-2xl tracking-tight">
				The first articles are on the way.
			</h2>
			<p className="mt-3 text-muted-foreground">
				We are writing up the techniques and lessons we teach every day on the
				floor.
			</p>
		</div>
	);
}
