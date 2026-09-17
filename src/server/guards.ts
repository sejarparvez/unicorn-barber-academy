// src/server/guards.ts
// Route-guard helper for TanStack Router beforeLoad. Resolves the session
// (via the client-safe getSession server function), bounces anonymous
// visitors to sign-in (preserving their destination), and enforces a role
// allow-list for privileged areas.
//
// This module IS imported by client route code, so it stays free of
// server-only imports. The in-handler endpoint guard lives in
// ./admin-guard.server (requireAdminSession).
//
// Usage in a route:
//   beforeLoad: async ({ location }) => ({
//     session: await requireRoles({
//       pathname: location.pathname,
//       search: location.search as Record<string, string>,
//       allowed: ["admin", "instructor"],
//     }),
//   }),
import { redirect } from "@tanstack/react-router";
import { parseRole, type Role } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
import { getSession } from "./session";

export async function requireRoles(options: {
	pathname: string;
	search?: Record<string, string>;
	/** Omit to allow any authenticated user (any role). */
	allowed?: Role[];
}): Promise<SessionPayload> {
	const session = await getSession();

	if (!session) {
		const qs = new URLSearchParams(options.search).toString();
		throw redirect({
			to: "/auth/signin",
			search: {
				redirect: qs ? `${options.pathname}?${qs}` : options.pathname,
			},
		});
	}

	if (options.allowed) {
		const role = parseRole(session.user.role);
		// Signed in but not privileged enough: send them to their own
		// dashboard rather than the sign-in flow.
		if (!role || !options.allowed.includes(role)) {
			throw redirect({ to: "/dashboard" });
		}
	}

	return session;
}

/**
 * Zero-cost role gate for routes nested under a parent that already resolved
 * the session (e.g. /dashboard children). beforeLoad runs serially parent →
 * child, so the parent's returned `session` is present in the child context.
 * This reads it in memory — no server call, no database read.
 *
 * Usage in a child route:
 *   beforeLoad: ({ context, location }) => ({
 *     session: requireRoleFromContext(context, ["admin"], location),
 *   }),
 */
export function requireRoleFromContext(
	context: { session?: SessionPayload | null },
	allowed: Role[],
	location: { pathname: string; search?: Record<string, string> | unknown },
): SessionPayload {
	const session = context.session ?? null;

	if (!session) {
		const search = location.search as Record<string, string> | undefined;
		const qs = new URLSearchParams(search ?? {}).toString();
		throw redirect({
			to: "/auth/signin",
			search: {
				redirect: qs ? `${location.pathname}?${qs}` : location.pathname,
			},
		});
	}

	const role = parseRole(session.user.role);
	if (!role || !allowed.includes(role)) {
		throw redirect({ to: "/dashboard" });
	}

	return session;
}
