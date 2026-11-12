// Shared HTML building blocks for transactional emails.
// Values interpolated into the templates are escaped because the signup name
// is free text and auth URLs can carry query params.

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function emailButton(url: string, label: string): string {
	return `<a href="${escapeHtml(url)}" style="display:inline-block;margin-top:8px;padding:12px 28px;background:#c9a227;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:bold;">${label}</a>`;
}

export function emailShell(title: string, body: string): string {
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

export function greeting(name: string): string {
	return escapeHtml(name.trim()) || 'there';
}
