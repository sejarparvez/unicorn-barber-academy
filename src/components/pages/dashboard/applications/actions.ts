import type { EnrollmentStatus } from '@/components/pages/enroll/types';

export type StatusAction = {
	label: string;
	status: EnrollmentStatus;
	primary?: boolean;
};

/** Which status transitions make sense from a given status. */
export function actionsFor(status: EnrollmentStatus): StatusAction[] {
	const actions: StatusAction[] = [];

	if (status !== 'active' && status !== 'completed') {
		actions.push({ label: 'Approve', status: 'active', primary: true });
	}
	if (
		status !== 'waitlisted' &&
		status !== 'active' &&
		status !== 'completed'
	) {
		actions.push({ label: 'Waitlist', status: 'waitlisted' });
	}
	if (status !== 'rejected') {
		actions.push({ label: 'Reject', status: 'rejected' });
	}
	if (status === 'active') {
		actions.push({ label: 'Mark completed', status: 'completed' });
		actions.push({ label: 'Withdraw', status: 'withdrawn' });
	}

	return actions;
}
