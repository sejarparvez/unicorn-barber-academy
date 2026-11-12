import { emailButton, emailShell, greeting } from './layout';

export function resetPasswordEmail(name: string, url: string): string {
	return emailShell(
		'Reset your password',
		`<p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Hi ${greeting(name)}, we received a request to reset your password. This link expires in one hour and can only be used once.</p>${emailButton(url, 'Choose a New Password')}`,
	);
}
