import { z } from 'zod';

export const contactSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, 'Please enter your full name.')
		.max(80, 'Name must be 80 characters or fewer.'),
	email: z
		.string()
		.trim()
		.min(1, 'Please enter your email address.')
		.email('Please enter a valid email address.'),
	phone: z
		.string()
		.trim()
		.max(24, 'Phone number must be 24 characters or fewer.')
		.refine(
			(value) => value === '' || /^\+?[\d\s()-]{7,}$/.test(value),
			'Please enter a valid phone number.',
		),
	interest: z.string().min(1, 'Please choose a program or enquiry type.'),
	message: z
		.string()
		.trim()
		.min(10, 'Please tell us a little more (at least 10 characters).')
		.max(1200, 'Message must be 1,200 characters or fewer.'),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
