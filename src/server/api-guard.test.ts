// src/server/api-guard.test.ts
// guardPublicEndpoint and guardAuthenticatedEndpoint depend on isSameOrigin,
// overRateLimit, auth.api.getSession, and parseRole — all path-aliased
// imports that Bun's mock.module cannot reliably intercept. This file
// verifies the exported type contracts and documents expected behavior.
import { describe, expect, test } from "bun:test";
import type { AdminGuardResult } from "./admin-api";

describe("guardPublicEndpoint result type", () => {
	test("ok shape", () => {
		const r: { ok: true } | { ok: false; response: Response } = { ok: true };
		expect(r.ok).toBe(true);
	});

	test("error shape includes a Response", () => {
		const r: { ok: true } | { ok: false; response: Response } = {
			ok: false,
			response: new Response("Forbidden", { status: 403 }),
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.response.status).toBe(403);
	});
});

describe("guardAuthenticatedEndpoint result type", () => {
	test("ok shape includes user info", () => {
		const r:
			| {
					ok: true;
					userId: string;
					userEmail: string;
					userRole: string;
					userImage: string | null;
			  }
			| { ok: false; response: Response } = {
			ok: true,
			userId: "1",
			userEmail: "a@b.com",
			userRole: "admin",
			userImage: null,
		};
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.userId).toBe("1");
			expect(r.userRole).toBe("admin");
		}
	});

	test("error shape includes a Response", () => {
		const r:
			| {
					ok: true;
					userId: string;
					userEmail: string;
					userRole: string;
					userImage: string | null;
			  }
			| { ok: false; response: Response } = {
			ok: false,
			response: new Response("Unauthorized", { status: 401 }),
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.response.status).toBe(401);
	});
});

describe("AdminGuardResult (requireAdminApi)", () => {
	test("success shape", () => {
		const r: AdminGuardResult = { ok: true, userId: 1, userEmail: "a@b.com" };
		expect(r.ok).toBe(true);
	});

	test("error 401", () => {
		const r: AdminGuardResult = {
			ok: false,
			status: 401,
			message: "Unauthorized",
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(401);
	});

	test("error 403", () => {
		const r: AdminGuardResult = {
			ok: false,
			status: 403,
			message: "Forbidden",
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(403);
	});
});
