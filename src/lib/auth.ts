// src/lib/auth.ts
// Server-only: mounted at /api/auth/* via src/routes/api/auth/$.tsx
//
// DB ownership: this pg Pool OWNS the better-auth tables (user/session/
// account/verification). Prisma-next mirrors the same schema in
// src/prisma/schema.prisma purely as contract documentation — do not point
// two ORMs at writes for these tables.
//
// Admin plugin adds `role`/`banned`/`banReason`/`banExpires` columns to the
// user table (see schema.prisma). Promote an account with:
//   bun scripts/set-admin.ts someone@example.com
import "dotenv/config";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import { resetPasswordEmail, sendMail, verificationEmail } from "@/lib/mail";

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const appOrigin = (() => {
	try {
		return new URL(appUrl).origin;
	} catch {
		return "http://localhost:3000";
	}
})();

// Fail fast rather than booting with an ephemeral/missing signing key.
if (!process.env.BETTER_AUTH_SECRET && process.env.NODE_ENV === "production") {
	throw new Error(
		"BETTER_AUTH_SECRET is not set. Generate one with: openssl rand -base64 32",
	);
}

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
		// Verified working with Neon's chain via system CAs. Override only if a
		// proxy/CA situation requires it by setting DATABASE_SSL_CA.
		ssl: process.env.DATABASE_SSL_CA
			? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
			: { rejectUnauthorized: true }, // Required for Neon SSL termination
	}),
	emailAndPassword: {
		enabled: true,
		// Sessions are only issued once emailVerified is true. Unverified
		// sign-in attempts fail with EMAIL_NOT_VERIFIED (handled in the UI).
		requireEmailVerification: true,
		// Without this, sessions issued before a reset stay valid after the
		// password changes — a hijacked session would survive recovery.
		revokeSessionsOnPasswordReset: true,
		sendResetPassword: async ({ user, url }) => {
			const sent = await sendMail({
				to: user.email,
				subject: "Reset your password | Unicorn Barber Training Academy",
				html: resetPasswordEmail(user.name ?? "", url),
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
			// After better-auth verifies the token server-side it redirects to
			// callbackURL. Callers that pass one explicitly (e.g. signup keeps
			// the original ?redirect= destination alive through verification)
			// win; otherwise route to the dedicated success page.
			const target = new URL(url);
			if (!target.searchParams.get("callbackURL")) {
				target.searchParams.set(
					"callbackURL",
					new URL("/auth/verify-email?state=success", appOrigin).toString(),
				);
			}
			const sent = await sendMail({
				to: user.email,
				subject: "Verify your email | Unicorn Barber Training Academy",
				html: verificationEmail(user.name ?? "", target.toString()),
			});
			if (!sent) {
				console.error(
					`[auth] Verification email FAILED to send for ${user.email} — check RESEND_API_KEY / EMAIL_FROM.`,
				);
			}
		},
		// Verification is mandatory (requireEmailVerification above): the mail
		// goes out on sign-up, and clicking the link auto-signs the user in.
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		expiresIn: 48 * 60 * 60,
	},
	rateLimit: {
		enabled: true,
		window: 60,
		max: 100,
		// Storage defaults to in-process memory: fine for a single instance
		// (upstream prunes at 100k entries), but per-instance counters when
		// scaled horizontally — move to Redis-backed `secondaryStorage` if you
		// run multiple replicas.
		// NOTE: better-auth 1.6.x ignores `specialRules` — the limiter only
		// reads its built-in defaults, plugin rules, and `customRules` (exact
		// path match against the /api/auth-relative pathname). customRules
		// are applied last, so these override the stricter built-ins.
		customRules: {
			"/sign-in/email": { window: 60, max: 10 },
			"/sign-up/email": { window: 60, max: 5 },
			"/request-password-reset": { window: 60, max: 3 },
			"/send-verification-email": { window: 60, max: 3 },
			"/sign-in/social": { window: 60, max: 20 },
		},
	},
	trustedOrigins: [appOrigin],
	// Google OAuth is wired but inert until GOOGLE_CLIENT_ID / SECRET exist in
	// .env — the conditional spread keeps dev booting without credentials.
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
			defaultRole: "user",
			adminRoles: ["admin"],
		}),
	],
	advanced: {
		// Behind a load balancer/CDN, X-Forwarded-For holds a comma chain and
		// better-auth refuses to guess: without proxy config every request
		// resolves to one shared "no trusted ip" bucket — collapsing ALL
		// rate limits into a single global counter (self-DoS). Configure via:
		//   TRUSTED_PROXIES="10.0.0.0/8,192.168.0.0/16"  (proxy CIDRs, chain is
		//                                                 stripped right→left)
		//   AUTH_IP_HEADERS="x-real-ip"                  (platform client-IP header)
		...(process.env.TRUSTED_PROXIES || process.env.AUTH_IP_HEADERS
			? {
					ipAddress: {
						...(process.env.TRUSTED_PROXIES
							? {
									trustedProxies: process.env.TRUSTED_PROXIES.split(",")
										.map((s) => s.trim())
										.filter(Boolean),
								}
							: {}),
						...(process.env.AUTH_IP_HEADERS
							? {
									ipAddressHeaders: process.env.AUTH_IP_HEADERS.split(",")
										.map((s) => s.trim())
										.filter(Boolean),
								}
							: {}),
					},
				}
			: {}),
		database: {
			// DB-side autoincrement ids (schema generated by better-auth CLI):
			// omit `id` on INSERT and let the Postgres sequence fill it.
			generateId: "serial",
		},
	},
});
