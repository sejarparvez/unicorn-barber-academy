// src/lib/api/contact.ts
import { http } from "./http";

export type ContactPayload = {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	program?: string;
	message: string;
};

export type ContactResponse = {
	success: boolean;
	message: string;
	inquiryId?: string;
};

export function submitContactMessage(payload: ContactPayload) {
	return http
		.post<ContactResponse>("/api/contact", payload)
		.then((res) => res.data);
}
