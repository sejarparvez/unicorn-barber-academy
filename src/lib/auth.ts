import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { resetPasswordEmail } from '@/components/emails/reset-password-email';
import { verificationEmail } from '@/components/emails/verification-email';
import { sendMail } from '@/server/mail';
import { db } from './db';

const appUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const appOrigin = (() => {
	try {
		return new URL(appUrl).origin;
	} catch {
		return 'http://localhost:3000';
	}
})();

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			const sent = await sendMail({
				to: user.email,
				subject: 'Reset your password | Unicorn Barber Training Academy',
				html: resetPasswordEmail(user.name ?? '', url),
			});
			if (!sent) {
				console.error(
					`[auth] Password-reset email FAILED to send for ${user.email} — check RESEND_API_KEY / EMAIL_FROM.`,
				);
			}
		},
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			const target = new URL(url);
			if (!target.searchParams.get('callbackURL')) {
				target.searchParams.set(
					'callbackURL',
					new URL('/auth/verify-email?state=success', appOrigin).toString(),
				);
			}
			const sent = await sendMail({
				to: user.email,
				subject: 'Verify your email | Unicorn Barber Training Academy',
				html: verificationEmail(user.name ?? '', target.toString()),
			});
			if (!sent) {
				console.error(
					`[auth] Verification email FAILED to send for ${user.email} — check RESEND_API_KEY / EMAIL_FROM.`,
				);
			}
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 48 * 60 * 60,
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
			strategy: 'compact',
		},
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
		customRules: {
			'/sign-in/email': { window: 60, max: 10 },
			'/sign-up/email': { window: 60, max: 5 },
			'/request-password-reset': { window: 60, max: 3 },
			'/send-verification-email': { window: 60, max: 3 },
			'/sign-in/social': { window: 60, max: 20 },
			'/admin/ban-user': { window: 60, max: 10 },
			'/admin/unban-user': { window: 60, max: 10 },
			'/admin/set-role': { window: 60, max: 10 },
			'/admin/remove-user': { window: 60, max: 5 },
			'/admin/impersonate': { window: 60, max: 5 },
			'/admin/stop-impersonating': { window: 60, max: 20 },
		},
	},
	trustedOrigins: [appOrigin],

	socialProviders: {
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					},
				}
			: {}),
	},
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
		tanstackStartCookies(),
	],
});
