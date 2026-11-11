import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({
	id,
	eyebrow,
	title,
	description,
	align = 'left',
	className,
}: {
	id?: string;
	eyebrow: string;
	title: ReactNode;
	description?: string;
	align?: 'left' | 'center';
	className?: string;
}) {
	const centered = align === 'center';

	return (
		<div
			className={cn('max-w-2xl', centered && 'mx-auto text-center', className)}
		>
			<div
				className={cn('flex items-center gap-3', centered && 'justify-center')}
			>
				<span
					aria-hidden="true"
					className="h-px w-8 bg-linear-to-r from-transparent to-primary/70"
				/>
				<span className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
					{eyebrow}
				</span>
				{centered && (
					<span
						aria-hidden="true"
						className="h-px w-8 bg-linear-to-l from-transparent to-primary/70"
					/>
				)}
			</div>

			<h2
				id={id}
				className="mt-5 text-balance font-bold text-3xl text-foreground leading-[1.1] tracking-tight sm:text-4xl"
			>
				{title}
			</h2>

			{description && (
				<p className="mt-4 text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
					{description}
				</p>
			)}
		</div>
	);
}
