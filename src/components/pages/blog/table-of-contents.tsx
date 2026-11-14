import { IconChevronDown, IconList } from '@tabler/icons-react';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import type { PostHeading } from '@/components/pages/blog/types';
import { cn } from '@/lib/utils';

/** Smooth-scrolls to an in-article heading and keeps the URL hash in sync. */
function scrollToHeading(event: MouseEvent<HTMLAnchorElement>, id: string) {
	event.preventDefault();
	const target = document.getElementById(id);
	if (!target) {
		return;
	}
	target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	window.history.replaceState(null, '', `#${id}`);
}

/** Tracks which section heading is currently in view as the reader scrolls. */
function useActiveHeading(headings: PostHeading[]): string {
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		if (headings.length === 0) {
			return;
		}

		const elements = headings
			.map((heading) => document.getElementById(heading.id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				const first = visible[0]?.target.id;
				if (first) {
					setActiveId(first);
				}
			},
			{ rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] },
		);

		for (const element of elements) {
			observer.observe(element);
		}
		return () => observer.disconnect();
	}, [headings]);

	return activeId;
}

/** Sticky "On this page" rail shown beside the article on large screens. */
export function TableOfContents({
	headings,
	className,
}: {
	headings: PostHeading[];
	className?: string;
}) {
	const activeId = useActiveHeading(headings);

	if (headings.length === 0) {
		return null;
	}

	return (
		<nav aria-label="On this page" className={className}>
			<p className="flex items-center gap-2 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.22em]">
				<IconList className="size-3.5" stroke={1.75} aria-hidden />
				On this page
			</p>
			<ul className="mt-4 space-y-0.5">
				{headings.map((heading) => {
					const active = activeId === heading.id;
					return (
						<li key={heading.id}>
							<a
								href={`#${heading.id}`}
								onClick={(event) => scrollToHeading(event, heading.id)}
								className={cn(
									'block border-border border-l-2 py-1.5 pl-4 text-sm transition-colors',
									heading.level === 3 && 'pl-8 text-[13px]',
									active
										? 'border-primary font-medium text-primary'
										: 'text-muted-foreground hover:border-primary/40 hover:text-foreground',
								)}
							>
								{heading.text}
							</a>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

/** Collapsible "On this page" list shown above the article on small screens. */
export function MobileTableOfContents({
	headings,
}: {
	headings: PostHeading[];
}) {
	if (headings.length === 0) {
		return null;
	}

	return (
		<details className="group mb-10 overflow-hidden rounded-xl border border-border bg-card">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-medium text-foreground text-sm [&::-webkit-details-marker]:hidden">
				<span className="flex items-center gap-2">
					<IconList className="size-4 text-primary" stroke={1.75} aria-hidden />
					On this page
				</span>
				<IconChevronDown
					className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
					stroke={1.75}
					aria-hidden
				/>
			</summary>
			<ul className="border-border border-t px-2 py-2">
				{headings.map((heading) => (
					<li key={heading.id}>
						<a
							href={`#${heading.id}`}
							onClick={(event) => scrollToHeading(event, heading.id)}
							className={cn(
								'block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
								heading.level === 3 && 'pl-6 text-[13px]',
							)}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</details>
	);
}
