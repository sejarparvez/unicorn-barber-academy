// src/server/contact-validate.ts
// Input validation for the public contact form submission. Extracted so
// validation rules can be unit-tested independently of the route handler.
import { CONTACT_SUBJECTS, type ContactSubject } from "@/data/contact";

export type ContactInput = {
	name: unknown;
	email: unknown;
	phone: unknown;
	program: unknown;
	message: unknown;
	subject: unknown;
};

export type ContactValidated =
	| {
			ok: true;
			name: string;
			email: string;
			phone: string;
			program: string;
			message: string;
			subject: ContactSubject;
	  }
	| { ok: false; status: number; message: string };

function text(value: unknown, max: number): string {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+]?[\d\s\-()]{10,30}$/;

export function validateContactInput(raw: ContactInput): ContactValidated {
	const name = text(raw.name, 120);
	const email = text(raw.email, 254);
	const phone = text(raw.phone, 30);
	const program = text(raw.program, 120);
	const message = text(raw.message, 5000);
	const subject = typeof raw.subject === "string" ? raw.subject : "";

	if (!name || !email || !subject || !message) {
		return {
			ok: false,
			status: 400,
			message: "All required fields must be filled",
		};
	}

	if (!emailRegex.test(email)) {
		return { ok: false, status: 400, message: "Invalid email format" };
	}

	if (phone && !phoneRegex.test(phone)) {
		return { ok: false, status: 400, message: "Invalid phone number" };
	}

	const topic = (CONTACT_SUBJECTS as readonly string[]).includes(subject)
		? (subject as ContactSubject)
		: null;
	if (!topic) {
		return { ok: false, status: 400, message: "Invalid subject" };
	}

	return { ok: true, name, email, phone, program, message, subject: topic };
}
