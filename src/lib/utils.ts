export { cn } from 'cn';

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
