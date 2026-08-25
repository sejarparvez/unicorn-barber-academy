import { afterEach, describe, expect, test } from "bun:test";
import { clientIp, overRateLimit } from "@/server/rate-limit";

function requestWith(headers: Record<string, string>): Request {
	return new Request("https://localhost/api/contact", {
		method: "POST",
		headers,
	});
}

const ENV_KEYS = ["TRUSTED_PROXIES", "AUTH_IP_HEADERS"] as const;

afterEach(() => {
	for (const key of ENV_KEYS) delete process.env[key];
});

describe("clientIp", () => {
	test("no proxy config: trusts the rightmost XFF entry (nearest honest proxy)", () => {
		const ip = clientIp(
			requestWith({ "x-forwarded-for": "9.9.9.9, 203.0.113.7" }),
		);
		expect(ip).toBe("203.0.113.7");
	});

	test("no headers at all → unknown bucket", () => {
		expect(clientIp(requestWith({}))).toBe("unknown");
	});

	test("falls back to x-real-ip when XFF absent", () => {
		expect(clientIp(requestWith({ "x-real-ip": "198.51.100.4" }))).toBe(
			"198.51.100.4",
		);
	});

	describe("AUTH_IP_HEADERS", () => {
		test("single-value platform header wins in priority order", () => {
			process.env.AUTH_IP_HEADERS = "cf-connecting-ip, x-real-ip";
			const req = requestWith({
				"cf-connecting-ip": "1.1.1.1",
				"x-real-ip": "2.2.2.2",
				"x-forwarded-for": "3.3.3.3",
			});
			expect(clientIp(req)).toBe("1.1.1.1");
		});

		test("skips absent headers down the priority list", () => {
			process.env.AUTH_IP_HEADERS = "cf-connecting-ip, x-real-ip";
			const req = requestWith({ "x-real-ip": "2.2.2.2" });
			expect(clientIp(req)).toBe("2.2.2.2");
		});
	});

	describe("TRUSTED_PROXIES chain stripping", () => {
		test("strips trusted rightmost hops (CIDR)", () => {
			process.env.TRUSTED_PROXIES = "10.0.0.0/8";
			const req = requestWith({
				"x-forwarded-for": "198.51.100.23, 10.1.2.3",
			});
			expect(clientIp(req)).toBe("198.51.100.23");
		});

		test("strips multiple trusted hops right-to-left", () => {
			process.env.TRUSTED_PROXIES = "10.0.0.0/8,192.168.0.0/16";
			const req = requestWith({
				"x-forwarded-for": "198.51.100.23, 10.1.2.3, 192.168.5.5",
			});
			expect(clientIp(req)).toBe("198.51.100.23");
		});

		test("untrusted entries are NOT stripped (spoof resistance)", () => {
			process.env.TRUSTED_PROXIES = "10.0.0.0/8";
			const req = requestWith({
				// Attacker prepends junk; the proxy appends the real peer.
				"x-forwarded-for": "6.6.6.6, 198.51.100.23, 10.1.2.3",
			});
			expect(clientIp(req)).toBe("198.51.100.23");
		});

		test("exact-IP trust entries match without CIDR", () => {
			process.env.TRUSTED_PROXIES = "127.0.0.1";
			const req = requestWith({
				"x-forwarded-for": "198.51.100.23, 127.0.0.1",
			});
			expect(clientIp(req)).toBe("198.51.100.23");
		});

		test("whole chain trusted degrades to x-real-ip/unknown (never spoofable leftmost)", () => {
			process.env.TRUSTED_PROXIES = "10.0.0.0/8";
			const withRealIp = requestWith({
				"x-forwarded-for": "10.0.0.1, 10.0.0.2",
				"x-real-ip": "198.51.100.23",
			});
			expect(clientIp(withRealIp)).toBe("198.51.100.23");
			const withoutRealIp = requestWith({
				"x-forwarded-for": "10.0.0.1, 10.0.0.2",
			});
			expect(clientIp(withoutRealIp)).toBe("unknown");
		});

		test("IPv6 hops against an IPv4-only matcher are treated as untrusted peers", () => {
			process.env.TRUSTED_PROXIES = "10.0.0.0/8";
			const req = requestWith({
				// Rightmost is the nearest hop — returning it stays spoof-safe.
				"x-forwarded-for": "6.6.6.6, 2001:db8::5",
			});
			expect(clientIp(req)).toBe("2001:db8::5");
		});
	});
});

describe("overRateLimit fixed window", () => {
	test("allows up to max then blocks within window", () => {
		const key = `test:${Math.random()}`;
		expect(overRateLimit(key, 2, 60_000)).toBe(false);
		expect(overRateLimit(key, 2, 60_000)).toBe(false);
		expect(overRateLimit(key, 2, 60_000)).toBe(true);
		expect(overRateLimit(key, 2, 60_000)).toBe(true);
	});

	test("window reset re-opens the bucket", async () => {
		const key = `test-reset:${Math.random()}`;
		expect(overRateLimit(key, 1, 30)).toBe(false);
		expect(overRateLimit(key, 1, 30)).toBe(true);
		await Bun.sleep(40);
		expect(overRateLimit(key, 1, 30)).toBe(false);
	});

	test("distinct keys have independent buckets", () => {
		const a = `a:${Math.random()}`;
		const b = `b:${Math.random()}`;
		expect(overRateLimit(a, 1, 60_000)).toBe(false);
		expect(overRateLimit(b, 1, 60_000)).toBe(false);
	});
});
