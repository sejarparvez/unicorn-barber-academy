// src/server/rate-limit.ts
// Abuse protection for the unauthenticated POST endpoints (/api/contact,
// /api/enroll): same-origin enforcement plus a fixed-window per-IP rate
// limiter. Deliberately dependency-free.
//
// The limiter is in-process memory, mirroring better-auth's default rate
// limit storage: correct for a single instance; per-instance counters when
// scaled horizontally (move to Redis if you run multiple replicas).

const buckets = new Map<string, { count: number; resetAt: number }>();
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
	if (now - lastSweep < SWEEP_INTERVAL_MS) return;
	lastSweep = now;
	for (const [key, bucket] of buckets) {
		if (bucket.resetAt <= now) buckets.delete(key);
	}
}

/** Returns true when the request should be rejected (over the limit). */
export function overRateLimit(
	key: string,
	max: number,
	windowMs: number,
): boolean {
	const now = Date.now();
	sweep(now);
	const bucket = buckets.get(key);
	if (!bucket || bucket.resetAt <= now) {
		buckets.set(key, { count: 1, resetAt: now + windowMs });
		return false;
	}
	bucket.count += 1;
	return bucket.count > max;
}

export function clientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const first = forwarded.split(",")[0]?.trim();
		if (first) return first;
	}
	return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Blocks cross-site browser submissions (CSRF-style form/fetch posts) by
 * requiring the Origin host to match the request host — or the configured
 * app origin, since reverse proxies can rewrite the Host header. Requests
 * without an Origin header (curl, server-to-server) pass through; the rate
 * limiter still applies to them.
 */
export function isSameOrigin(request: Request): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return true;
	let originHost: string;
	try {
		originHost = new URL(origin).host;
	} catch {
		return false;
	}
	try {
		if (originHost === new URL(request.url).host) return true;
	} catch {
		// fall through to env comparison
	}
	const appUrl = process.env.BETTER_AUTH_URL;
	if (!appUrl) return false;
	try {
		return originHost === new URL(appUrl).host;
	} catch {
		return false;
	}
}
