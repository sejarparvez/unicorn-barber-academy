// src/server/guards.test.ts
import { afterEach, describe, expect, mock, test } from "bun:test";
import type { Role } from "@/lib/roles";

import type { SessionPayload } from "@/lib/types";
import { AdminAccessError } from "./admin-access-error";

// Mock session module before importing guards
const getSession = mock(
	(): Promise<SessionPayload | null> => Promise.resolve(null),
);
mock.module("./session", () => ({ getSession }));

const { requireRoles, requireAdminSession } = await import("./guards");

function makeSession(role: Role = "admin"): SessionPayload {
	return {
		user: {
			id: "1",
			email: "test@example.com",
			name: "Test User",
			image: null,
			emailVerified: true,
			role,
		},
		session: {
			id: "sess_1",
			expiresAt: new Date(Date.now() + 86400000).toISOString(),
		},
	};
}

afterEach(() => {
	getSession.mockClear();
});

describe("requireRoles", () => {
	test("throws redirect to sign-in when no session", async () => {
		getSession.mockReturnValue(Promise.resolve(null));
		try {
			await requireRoles({ pathname: "/dashboard/blog" });
			expect(true).toBe(false);
		} catch (err: unknown) {
			const e = err as {
				options: { to: string; search: { redirect: string } };
			};
			expect(e.options.to).toBe("/auth/signin");
			expect(e.options.search.redirect).toBe("/dashboard/blog");
		}
	});

	test("preserves query string in redirect", async () => {
		getSession.mockReturnValue(Promise.resolve(null));
		try {
			await requireRoles({
				pathname: "/dashboard/enrollments",
				search: { status: "pending", page: "2" },
			});
			expect(true).toBe(false);
		} catch (err: unknown) {
			const e = err as { options: { search: { redirect: string } } };
			expect(e.options.search.redirect).toBe(
				"/dashboard/enrollments?status=pending&page=2",
			);
		}
	});

	test("returns session when no allowed list (any role accepted)", async () => {
		const session = makeSession("user");
		getSession.mockReturnValue(Promise.resolve(session));
		const result = await requireRoles({ pathname: "/dashboard" });
		expect(result).toBe(session);
	});

	test("returns session when role is in allowed list", async () => {
		const session = makeSession("admin");
		getSession.mockReturnValue(Promise.resolve(session));
		const result = await requireRoles({
			pathname: "/dashboard/blog",
			allowed: ["admin"],
		});
		expect(result).toBe(session);
	});

	test("throws redirect to dashboard when role not allowed", async () => {
		const session = makeSession("student");
		getSession.mockReturnValue(Promise.resolve(session));
		try {
			await requireRoles({
				pathname: "/dashboard/blog",
				allowed: ["admin"],
			});
			expect(true).toBe(false);
		} catch (err: unknown) {
			const e = err as { options: { to: string } };
			expect(e.options.to).toBe("/dashboard");
		}
	});

	test("throws redirect for user role when only admin allowed", async () => {
		const session = makeSession("user");
		getSession.mockReturnValue(Promise.resolve(session));
		try {
			await requireRoles({
				pathname: "/dashboard/enrollments",
				allowed: ["admin"],
			});
			expect(true).toBe(false);
		} catch (err: unknown) {
			const e = err as { options: { to: string } };
			expect(e.options.to).toBe("/dashboard");
		}
	});

	test("allows instructor role when in allowed list", async () => {
		const session = makeSession("instructor");
		getSession.mockReturnValue(Promise.resolve(session));
		const result = await requireRoles({
			pathname: "/dashboard",
			allowed: ["admin", "instructor"],
		});
		expect(result).toBe(session);
	});
});

describe("requireAdminSession", () => {
	test("returns session for admin user", async () => {
		const session = makeSession("admin");
		getSession.mockReturnValue(Promise.resolve(session));
		const result = await requireAdminSession();
		expect(result).toBe(session);
	});

	test("throws AdminAccessError for non-admin user", async () => {
		const session = makeSession("student");
		getSession.mockReturnValue(Promise.resolve(session));
		try {
			await requireAdminSession();
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AdminAccessError);
		}
	});

	test("throws AdminAccessError when no session", async () => {
		getSession.mockReturnValue(Promise.resolve(null));
		try {
			await requireAdminSession();
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AdminAccessError);
		}
	});

	test("throws AdminAccessError for user role", async () => {
		const session = makeSession("user");
		getSession.mockReturnValue(Promise.resolve(session));
		try {
			await requireAdminSession();
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AdminAccessError);
		}
	});
});
