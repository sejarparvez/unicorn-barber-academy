// src/lib/env.ts
// Client-safe environment/origin helpers. `import.meta.env.SSR` is statically
// true on the server and false in the browser bundle, so the process.env
// branch never ships to clients.
//
// Note: SSR pages read the session through src/server/session.ts rather than
// auth-client, because a server-side fetch cannot see the visitor's cookies.

function appUrlRaw(): string {
	if (!import.meta.env.SSR) return window.location.origin;
	try {
		return new URL(
			process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
		).toString();
	} catch {
		return "http://localhost:3000";
	}
}

/** Absolute origin of the running app (no path, no trailing slash). */
export const APP_ORIGIN = (() => {
	try {
		return new URL(appUrlRaw()).origin;
	} catch {
		return "http://localhost:3000";
	}
})();
