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

export async function submitContactMessage(
	payload: ContactPayload,
): Promise<ContactResponse> {
	try {
		const res = await http.post<ContactResponse>("/api/contact", payload);
		return res.data;
	} catch (error) {
		if (typeof error === "object" && error !== null) {
			const data = (error as { response?: { data?: { message?: string } } })
				.response?.data;
			if (data?.message) throw new Error(data.message);
		}
		throw new Error("Something went wrong. Please try again.");
	}
}
