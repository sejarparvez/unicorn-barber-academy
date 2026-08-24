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

/**
 * Client-IP resolution mirroring src/server/auth.ts (same env contract):
 *   AUTH_IP_HEADERS  — platform-set single-value headers, priority order
 *   TRUSTED_PROXIES  — proxy CIDRs; the X-Forwarded-For chain is stripped
 *                      right-to-left past trusted hops
 * With neither configured, the rightmost XFF entry is used: the nearest
 * reverse proxy's view of the peer. Unlike the leftmost entry it cannot be
 * overwritten by a spoofed client header when at least one honest proxy
 * sits in front of the app.
 */
export function clientIp(request: Request): string {
	for (const name of configuredIpHeaders()) {
		const value = request.headers.get(name)?.trim();
		if (value) return value;
	}

	const chain = (request.headers.get("x-forwarded-for") ?? "")
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);

	const cidrs = trustedProxyCidrs();
	if (cidrs.length > 0 && chain.length > 0) {
		for (let i = chain.length - 1; i >= 0; i--) {
			const entry = chain[i];
			if (entry && !isTrustedProxyIp(entry, cidrs)) return entry;
		}
		return chain[0] ?? "unknown";
	}

	return (
		chain[chain.length - 1] ??
		request.headers.get("x-real-ip")?.trim() ??
		"unknown"
	);
}

function configuredIpHeaders(): string[] {
	return (process.env.AUTH_IP_HEADERS ?? "")
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
}

function trustedProxyCidrs(): string[] {
	return (process.env.TRUSTED_PROXIES ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

function isTrustedProxyIp(ip: string, cidrs: string[]): boolean {
	return cidrs.some((cidr) => {
		if (cidr === ip) return true;
		const slash = cidr.lastIndexOf("/");
		if (slash === -1) return false;
		const base = ipv4ToLong(cidr.slice(0, slash));
		const addr = ipv4ToLong(ip);
		const bits = Number(cidr.slice(slash + 1));
		if (base === null || addr === null || !Number.isInteger(bits)) return false;
		if (bits <= 0) return true;
		const mask = (0xffffffff << (32 - Math.min(bits, 32))) >>> 0;
		return (addr & mask) === (base & mask);
	});
}

function ipv4ToLong(ip: string): number | null {
	const parts = ip.split(".");
	if (parts.length !== 4) return null;
	let out = 0;
	for (const part of parts) {
		const n = Number(part);
		if (
			!Number.isInteger(n) ||
			n < 0 ||
			n > 255 ||
			!Number.isSafeInteger(out * 256 + n)
		) {
			return null;
		}
		out = out * 256 + n;
	}
	return out;
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
