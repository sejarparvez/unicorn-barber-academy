import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { PostSummary } from '@/components/pages/blog/types';

/** Older/newer article links that let a reader keep moving through the archive. */
export function PostNavigation({
	newer,
	older,
}: {
	newer: PostSummary | null;
	older: PostSummary | null;
}) {
	if (!newer && !older) {
		return null;
	}

	return (
		<nav
			aria-label="More articles"
			className="mt-12 grid gap-4 border-border border-t pt-8 sm:grid-cols-2"
		>
			{older ? (
				<Link
					to="/blog/$slug"
					params={{ slug: older.slug }}
					className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
				>
					<span className="flex items-center gap-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em] transition-colors group-hover:text-primary">
						<IconArrowLeft className="size-3.5" stroke={1.75} aria-hidden />
						Older post
					</span>
					<span className="text-balance font-medium text-foreground text-sm leading-snug">
						{older.title}
					</span>
				</Link>
			) : (
				<span aria-hidden="true" />
			)}

			{newer ? (
				<Link
					to="/blog/$slug"
					params={{ slug: newer.slug }}
					className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 sm:items-end sm:text-right"
				>
					<span className="flex items-center gap-2 font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.18em] transition-colors group-hover:text-primary">
						Newer post
						<IconArrowRight className="size-3.5" stroke={1.75} aria-hidden />
					</span>
					<span className="text-balance font-medium text-foreground text-sm leading-snug">
						{newer.title}
					</span>
				</Link>
			) : null}
		</nav>
	);
}
