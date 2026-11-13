import type { ComponentType } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
	icon: Icon,
	label,
	value,
	hint,
	className,
}: {
	icon: ComponentType<{ className?: string; stroke?: number }>;
	label: string;
	value: string;
	hint?: string;
	className?: string;
}) {
	return (
		<Card className={cn('h-full', className)}>
			<CardContent className="flex items-start gap-3">
				<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/[0.06] text-primary">
					<Icon className="size-4.5" stroke={1.6} />
				</span>
				<div className="flex min-w-0 flex-col gap-0.5">
					<span className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.14em]">
						{label}
					</span>
					<span className="font-semibold text-xl tabular-nums tracking-tight">
						{value}
					</span>
					{hint ? (
						<span className="text-muted-foreground text-xs">{hint}</span>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
