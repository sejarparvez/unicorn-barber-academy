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
const MAX_BUCKETS = 100_000;

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
		// Evict oldest entry when at capacity to prevent memory exhaustion
		// from spoofed unique-IP keys.
		if (buckets.size >= MAX_BUCKETS) {
			const oldest = buckets.keys().next().value;
			if (oldest) buckets.delete(oldest);
		}
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
		// Every entry matched as trusted (or the CIDR list couldn't classify
		// them, e.g. IPv6 hops against an IPv4-only matcher). Falling back to
		// chain[0] would hand attackers a spoofable key, so degrade to the
		// shared bucket instead — same philosophy as better-auth's config.
		return request.headers.get("x-real-ip")?.trim() ?? "unknown";
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
		if (part === "") return null; // "1..2.3"
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
 * app origin, since reverse proxies can rewrite the Host header. For POST
 * requests, rejects when neither Origin nor Referer is present (script-based
 * CSRF without an Origin header is blocked). GET requests pass through
 * unconditionally.
 */
export function isSameOrigin(request: Request): boolean {
	// GET requests are safe — browsers never cross-origin GET with credentialed
	// form submissions, and the rate limiter still applies.
	if (request.method === "GET") return true;

	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");

	// For POST, require at least one of Origin or Referer to be present.
	// Script-based attacks that omit both are blocked.
	if (!origin && !referer) return false;

	let originHost: string;
	try {
		originHost = new URL(origin || referer || "").host;
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
