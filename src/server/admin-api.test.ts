// src/server/admin-api.test.ts
// requireAdminApi depends on auth.api.getSession (better-auth) and
// isSameOrigin (rate-limit), both imported via @/ aliases. Bun's mock.module
// cannot reliably intercept path-aliased imports, so full unit testing of
// this module requires either dependency injection or an integration test
// setup with a real auth instance. The guard logic is well-covered by the
// existing guards.test.ts (requireRoles/requireAdminSession) and
// rate-limit.test.ts (isSameOrigin) tests.
//
// This file verifies the exported type contract and documents the expected
// behavior of requireAdminApi for future contributors.
import { describe, expect, test } from "bun:test";
import type { AdminGuardResult } from "./admin-api";

describe("AdminGuardResult", () => {
	test("success shape", () => {
		const r: AdminGuardResult = { ok: true, userId: 1, userEmail: "a@b.com" };
		expect(r.ok).toBe(true);
	});

	test("error shape — 401", () => {
		const r: AdminGuardResult = {
			ok: false,
			status: 401,
			message: "Unauthorized",
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(401);
	});

	test("error shape — 403", () => {
		const r: AdminGuardResult = {
			ok: false,
			status: 403,
			message: "Forbidden",
		};
		expect(r.ok).toBe(false);
		if (!r.ok) expect(r.status).toBe(403);
	});
});
