// server/middleware/security.ts
// Sets security headers on every response. CSP starts in report-only
// mode so broken policies don't break the site — switch to enforcement
// once violations are reviewed.
//
// Nitro auto-imports middleware from server/middleware/.
import {
	defineEventHandler,
	setResponseHeader,
} from "h3";

const CSP_DIRECTIVES = [
	"default-src 'self'",
	"script-src 'self' https://plausible.io",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' https://*.cloudinary.com data: blob:",
	"font-src 'self'",
	"connect-src 'self' https://plausible.io",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'",
].join("; ");

export default defineEventHandler((event) => {
	setResponseHeader(event, "Content-Security-Policy-Report-Only", CSP_DIRECTIVES);
	setResponseHeader(event, "X-Content-Type-Options", "nosniff");
	setResponseHeader(event, "X-Frame-Options", "DENY");
	setResponseHeader(event, "Referrer-Policy", "strict-origin-when-cross-origin");
	setResponseHeader(
		event,
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=()",
	);
});
