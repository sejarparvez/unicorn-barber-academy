// src/lib/mail.ts
// Server-only transactional email via the Resend REST API (plain fetch —
// intentionally no SDK dependency). When RESEND_API_KEY is absent (local dev,
// CI) mail calls become console logs instead of hard failures so auth flows
// keep working end-to-end with links printed to the server terminal.
//
// Env:
//   RESEND_API_KEY  — from resend.com dashboard (API keys)
//   EMAIL_FROM      — "Academy <no-reply@yourdomain>"; onboarding@resend.dev
//                     works out of the box for testing before domain setup.
export type MailInput = {
	to: string;
	subject: string;
	html: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function fromAddress(): string {
	return (
		process.env.EMAIL_FROM ?? "Unicorn Barber Academy <onboarding@resend.dev>"
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
		const res = await fetch(RESEND_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: fromAddress(),
				to: [to],
				subject,
				html,
			}),
		});
		if (!res.ok) {
			console.error(
				`[mail] Resend rejected "${subject}" for ${to}: ${res.status} ${await res.text()}`,
			);
			return false;
		}
		return true;
	} catch (error) {
		console.error(`[mail] Failed sending "${subject}" to ${to}:`, error);
		return false;
	}
}

function shell(title: string, body: string): string {
	return `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;color:#1c1c1a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <div style="max-width:480px;background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e7e5df;">
          <p style="margin:0 0 24px;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#8a7b3f;">Unicorn Barber Training Academy</p>
          <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">${title}</h1>
          ${body}
          <p style="margin:32px 0 0;font-size:12px;color:#8b8b85;">If you didn't request this email you can safely ignore it.</p>
        </div>
      </td></tr>
    </table>
  </body>
</html>`;
}

/**
 * Escapes HTML entities so user-supplied values (the signup name is free
 * text) can't inject markup into email bodies — content spoofing, phishing
 * links, broken layouts. Also used for href attributes since better-auth
 * URLs carry query params (& must be entity-encoded in HTML anyway).
 */
function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function button(url: string, label: string): string {
	return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:12px 28px;background:#c9a227;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">${label}</a>`;
}

export function verificationEmail(name: string, url: string): string {
	return shell(
		"Confirm your email",
		`<p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Hi ${escapeHtml(name) || "there"}, welcome to Unicorn Barber Training Academy. Confirm your email address to finish setting up your account.</p>${button(url, "Verify Email")}`,
	);
}

export function resetPasswordEmail(name: string, url: string): string {
	return shell(
		"Reset your password",
		`<p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Hi ${escapeHtml(name) || "there"}, we received a request to reset your password. This link expires in one hour and can only be used once.</p>${button(url, "Choose a New Password")}`,
	);
}
