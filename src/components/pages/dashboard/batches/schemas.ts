import { z } from 'zod';

export const BATCH_STATUSES = [
	'upcoming',
	'running',
	'completed',
	'cancelled',
] as const;

export const BATCH_STATUS_LABELS: Record<
	(typeof BATCH_STATUSES)[number],
	string
> = {
	upcoming: 'Upcoming',
	running: 'Running',
	completed: 'Completed',
	cancelled: 'Cancelled',
};

export const batchSchema = z
	.object({
		programId: z.string().trim().min(1, 'Choose a program.'),
		name: z
			.string()
			.trim()
			.min(2, 'Please enter a batch name.')
			.max(60, 'Batch name must be 60 characters or fewer.'),
		startDate: z.string().trim().min(1, 'Choose a start date.'),
		endDate: z.string().trim(),
		schedule: z
			.string()
			.trim()
			.min(2, 'Please enter the class times.')
			.max(120, 'Schedule must be 120 characters or fewer.'),
		capacity: z
			.number()
			.int('Capacity must be a whole number.')
			.min(1, 'Capacity must be at least 1.')
			.max(1000, 'Capacity must be 1,000 or lower.'),
		status: z.enum(BATCH_STATUSES, { message: 'Choose a status.' }),
		hidden: z.boolean(),
	})
	.refine((value) => !value.endDate || value.endDate >= value.startDate, {
		message: 'End date must be on or after the start date.',
		path: ['endDate'],
	});

export type BatchFormValues = z.infer<typeof batchSchema>;

/** Converts an ISO timestamp to the `YYYY-MM-DD` a date input expects. */
export function toDateInput(iso: string | null): string {
	return iso ? iso.slice(0, 10) : '';
}
