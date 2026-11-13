export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

export const ENQUIRY_STATUSES = [
	'new',
	'in_progress',
	'resolved',
	'spam',
] as const satisfies readonly EnquiryStatus[];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
	new: 'New',
	in_progress: 'In progress',
	resolved: 'Resolved',
	spam: 'Spam',
};

export function formatEnquiryDate(value: string) {
	return new Date(value).toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function formatEnquiryDateTime(value: string) {
	return new Date(value).toLocaleString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	});
}
