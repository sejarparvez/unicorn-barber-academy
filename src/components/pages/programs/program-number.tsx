import { cn } from '@/lib/utils';

type ProgramNumberSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<ProgramNumberSize, string> = {
	sm: 'size-8 rounded-lg text-[10px]',
	md: 'size-11 rounded-xl text-xs',
	lg: 'size-12 rounded-xl text-sm',
	xl: 'size-14 rounded-2xl text-base',
};

/** Zero-padded catalogue position — derived from order, never stored. */
export function formatProgramNumber(position: number) {
	return String(Math.max(position, 1)).padStart(2, '0');
}

export function ProgramNumber({
	position,
	size = 'md',
	className,
}: {
	position: number;
	size?: ProgramNumberSize;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				'relative flex shrink-0 items-center justify-center overflow-hidden border border-primary/25 bg-primary/5 font-mono font-semibold text-primary tabular-nums tracking-[0.12em] transition-colors group-hover:bg-primary/10',
				SIZE_CLASSES[size],
				className,
			)}
		>
			<span className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-transparent" />
			<span className="relative">{formatProgramNumber(position)}</span>
			<span className="absolute inset-x-2 bottom-1.5 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
		</span>
	);
}
