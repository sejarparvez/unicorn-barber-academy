import { createServerFn } from '@tanstack/react-start';
import {
	type ContactFormValues,
	contactSchema,
} from '@/components/pages/contact/form-schema';
import { db } from '@/lib/db';
import { sendMail } from '@/server/mail';

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

/** Best-effort heads-up to admissions; never blocks or fails the submission. */
async function notifyAdmissions(values: ContactFormValues) {
	const to = process.env.CONTACT_NOTIFY_EMAIL;
	if (!to) {
		return;
	}

	const rows: [string, string][] = [
		['Name', values.name],
		['Email', values.email],
		['Phone', values.phone || '—'],
		['Interested in', values.interest],
	];

	await sendMail({
		to,
		subject: `New enquiry from ${values.name}`,
		html: [
			'<h2>New enquiry</h2>',
			'<table cellpadding="6">',
			...rows.map(
				([label, value]) =>
					`<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`,
			),
			'</table>',
			`<p>${escapeHtml(values.message).replaceAll('\n', '<br />')}</p>`,
			'<p>Reply from the dashboard at /dashboard/enquiries.</p>',
		].join(''),
	});
}

/** Public contact form submission. Stores the message for the admin inbox. */
export const submitEnquiry = createServerFn({ method: 'POST' })
	.validator((input: unknown) => contactSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		const enquiry = await db.enquiry.create({
			data: {
				name: data.name,
				email: data.email,
				phone: data.phone.length ? data.phone : null,
				interest: data.interest,
				message: data.message,
			},
			select: { id: true },
		});

		try {
			await notifyAdmissions(data);
		} catch (error) {
			console.error('[enquiries] notification failed:', error);
		}

		return { id: enquiry.id };
	});
