export type EnrollmentStatus =
	| 'applied'
	| 'waitlisted'
	| 'rejected'
	| 'active'
	| 'completed'
	| 'withdrawn';

/** Human-readable label and tone for an enrollment status. */
export const ENROLLMENT_STATUS_META: Record<
	EnrollmentStatus,
	{ label: string; tone: 'neutral' | 'warning' | 'success' | 'danger' }
> = {
	applied: { label: 'Applied', tone: 'neutral' },
	waitlisted: { label: 'Waitlisted', tone: 'warning' },
	rejected: { label: 'Not accepted', tone: 'danger' },
	active: { label: 'Active', tone: 'success' },
	completed: { label: 'Completed', tone: 'success' },
	withdrawn: { label: 'Withdrawn', tone: 'neutral' },
};

export function formatBatchDate(value: string) {
	return new Date(value).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}
