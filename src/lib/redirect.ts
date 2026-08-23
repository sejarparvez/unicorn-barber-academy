// src/lib/redirect.ts
/**
 * Validates a user-supplied redirect path so it can never leave the site.
 * Accepts only same-origin relative paths: a single leading "/", no
 * protocol-relative "//host", no backslash tricks ("/\\evil.com"), and no
 * control characters. Anything else falls back to `fallback`.
 */
export function safeRedirect(path?: string | null, fallback = "/"): string {
	if (!path || typeof path !== "string") return fallback;
	if (!path.startsWith("/")) return fallback;
	if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
	for (const ch of path) {
		const code = ch.codePointAt(0);
		if (code !== undefined && (code <= 0x1f || code === 0x7f)) return fallback;
	}
	return path;
}
