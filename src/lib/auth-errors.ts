// src/lib/auth-errors.ts
/** Maps raw better-auth error messages to friendlier first-run copy. */
export function friendlyAuthError(message?: string | null): string {
	if (!message) return "Something went wrong. Please try again.";
	if (/provider|not configured|invalid oauth|unsupported/i.test(message)) {
		return "Google sign-in isn't configured yet — please use email and password.";
	}
	if (/popup|cancel|closed|abort/i.test(message)) {
		return "The Google window closed before finishing. Please try again.";
	}
	return message;
}
