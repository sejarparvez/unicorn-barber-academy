// Server-only transactional email via the Resend REST API.
// No SDK dependency — a plain fetch keeps the server bundle small.
//
// Env:
//   RESEND_API_KEY — from resend.com dashboard (API keys)
//   EMAIL_FROM     — "Academy <no-reply@yourdomain>"; onboarding@resend.dev
//                    works out of the box for testing before domain setup.
//
// When RESEND_API_KEY is absent (local dev, CI) sending is skipped and the
// call returns false; callers log it. This keeps auth flows testable without
// silently pretending an email was delivered.
export type MailInput = {
	to: string;
	subject: string;
	html: string;
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function fromAddress(): string {
	return (
		process.env.EMAIL_FROM ??
		'Unicorn Barber Training Academy <onboarding@resend.dev>'
	);
}

export async function sendMail({
	to,
	subject,
	html,
}: MailInput): Promise<boolean> {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		console.info(
			`[mail] RESEND_API_KEY not set — skipped sending "${subject}" to ${to}`,
		);
		return false;
	}

	try {
		const response = await fetch(RESEND_ENDPOINT, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: fromAddress(),
				to: [to],
				subject,
				html,
			}),
		});

		if (!response.ok) {
			console.error(
				`[mail] Resend rejected "${subject}" for ${to}: ${response.status} ${await response.text()}`,
			);
			return false;
		}

		return true;
	} catch (error) {
		console.error(`[mail] Failed sending "${subject}" to ${to}:`, error);
		return false;
	}
}
