// src/lib/env.ts
// Client-safe environment/origin helpers. `import.meta.env.SSR` is statically
// true on the server and false in the browser bundle, so the process.env
// branch never ships to clients.
//
// Note: SSR pages read the session through src/server/session.ts rather than
// auth-client, because a server-side fetch cannot see the visitor's cookies.

function appUrlRaw(): string {
	if (!import.meta.env.SSR) return window.location.origin;
	const raw = process.env.BETTER_AUTH_URL;
	// A silent localhost fallback in production breaks email verification
	// links and trusted-origin checks — fail loudly instead.
	if (!raw && process.env.NODE_ENV === "production") {
		throw new Error(
			"BETTER_AUTH_URL must be set to the app's absolute origin in production",
		);
	}
	try {
		return new URL(raw ?? "http://localhost:3000").toString();
	} catch {
		if (process.env.NODE_ENV === "production") {
			throw new Error(`BETTER_AUTH_URL is not a valid URL: "${raw}"`);
		}
		return "http://localhost:3000";
	}
}

/** Absolute origin of the running app (no path, no trailing slash).
 *  Deliberately NOT wrapped in a catch: appUrlRaw's production fail-fast
 *  must be able to stop boot when BETTER_AUTH_URL is missing/invalid —
 *  swallowing it here silently poisoned every absolute URL we emit. */
export const APP_ORIGIN = new URL(appUrlRaw()).origin;
