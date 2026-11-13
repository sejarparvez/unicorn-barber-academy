import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ENROLLMENT_STATUS_META, type EnrollmentStatus } from './types';

const TONE_CLASSES = {
	neutral: 'border-border text-muted-foreground',
	warning: 'border-amber-500/30 text-amber-600',
	success: 'border-emerald-500/30 text-emerald-600',
	danger: 'border-destructive/30 text-destructive',
} as const;

export function EnrollmentStatusBadge({
	status,
}: {
	status: EnrollmentStatus;
}) {
	const meta = ENROLLMENT_STATUS_META[status];

	return (
		<Badge variant="outline" className={cn(TONE_CLASSES[meta.tone])}>
			{meta.label}
		</Badge>
	);
}
