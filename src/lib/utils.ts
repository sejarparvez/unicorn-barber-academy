import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

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

/**
 * The function `getInitials` takes a name as input and returns the initials of the name in uppercase.
 * @param {string | null} [name] - The `getInitials` function takes an optional `name` parameter of
 * type string or null. It returns the initials of the name provided. If the name is null or an empty
 * string, it returns an empty string. If the name is a single word, it returns the initial letter of
 * that
 * @returns The `getInitials` function returns the initials of a given name. If the name is null or
 * empty, it returns an empty string. If the name is a single word, it returns the uppercase initial of
 * that word. If the name consists of multiple words, it returns the uppercase initials of the first
 * and last words.
 */
export function getInitials(name?: string | null): string {
	if (!name) {
		return "";
	}
	const words = name.trim().split(" ");
	if (words.length === 1) {
		return words[0][0].toUpperCase();
	} // Handles single-word names
	return `${words[0][0].toUpperCase()}${words[words.length - 1][0].toUpperCase()}`; // Handles multi-word names
}
