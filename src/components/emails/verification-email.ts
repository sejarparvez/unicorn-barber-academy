import { emailButton, emailShell, greeting } from './layout';

export function verificationEmail(name: string, url: string): string {
	return emailShell(
		'Confirm your email',
		`<p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Hi ${greeting(name)}, welcome to Unicorn Barber Training Academy. Confirm your email address to finish setting up your account.</p>${emailButton(url, 'Verify Email')}`,
	);
}
