// src/data/contact.ts
// Shared contact-form constants. Single source of truth for the
// subject/topic values used by both the contact page and the API route.

export const CONTACT_SUBJECTS = [
	"student",
	"partner",
	"press",
	"other",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const SUBJECT_OPTIONS: Array<{ value: ContactSubject; label: string }> =
	[
		{ value: "student", label: "Prospective student" },
		{ value: "partner", label: "Salon or barbershop partnership" },
		{ value: "press", label: "Press & media" },
		{ value: "other", label: "Something else" },
	];

export const TOPIC_LABELS: Record<ContactSubject, string> = {
	student: "Admissions",
	partner: "Partnership",
	press: "Press & media",
	other: "Other",
};
