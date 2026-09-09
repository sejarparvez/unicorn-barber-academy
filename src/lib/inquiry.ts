// src/lib/inquiry.ts
// Client-safe contact-inbox domain types.
export type InquiryRow = {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	subject: string;
	program: string | null;
	message: string;
	isRead: boolean;
	isReplied: boolean;
	createdAt: string;
};

export type InquiryListResult = {
	items: InquiryRow[];
	total: number;
	unread: number;
	page: number;
	totalPages: number;
};
