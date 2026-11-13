export { cn } from 'cn';

/**
 * Keeps user-supplied redirects on this site. Accepts only relative paths
 * starting with a single "/" and rejects protocol-relative URLs, backslash
 * tricks, and control characters.
 */
export function safeRedirect(path?: string | null, fallback = '/'): string {
	if (!path || typeof path !== 'string') {
		return fallback;
	}
	if (!path.startsWith('/')) {
		return fallback;
	}
	if (path.startsWith('//') || path.startsWith('/\\')) {
		return fallback;
	}
	for (const character of path) {
		const code = character.codePointAt(0);
		if (code !== undefined && (code <= 0x1f || code === 0x7f)) {
			return fallback;
		}
	}
	return path;
}

/** Formats an amount in Bangladeshi Taka, e.g. 12000 → "৳12,000". */
export function formatTaka(amount: number): string {
	return `৳${amount.toLocaleString('en-US')}`;
}

export function getInitials(name?: string | null): string {
	if (!name) {
		return '';
	}
	const words = name.trim().split(/\s+/).filter(Boolean);
	const first = words[0]?.[0] ?? '';
	if (words.length <= 1) {
		return first.toUpperCase();
	}
	const last = words[words.length - 1]?.[0] ?? '';
	return `${first}${last}`.toUpperCase();
}
