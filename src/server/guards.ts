// src/server/guards.ts
// Route-guard helper for TanStack Router beforeLoad. Resolves the session
// server-side, bounces anonymous visitors to sign-in (preserving their
// destination), and enforces a role allow-list for privileged areas.
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
import { AdminAccessError } from "./admin-access-error";
import { getSession, resolveSession } from "./session";

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

/**
 * In-handler guard for createServerFn endpoints. Route beforeLoad guards do
 * NOT protect server functions — each compiled server fn is its own public
 * RPC endpoint — so any privileged fn must call this inside its handler.
 *
 * Pass `authoritative: true` from mutation handlers so the role/ban read
 * bypasses the cookie-cache and hits the database — a demoted or banned admin
 * must not keep write access until the cache cookie expires.
 */
export async function requireAdminSession(options?: {
	authoritative?: boolean;
}): Promise<SessionPayload> {
	const session = options?.authoritative
		? await resolveSession({ authoritative: true })
		: await getSession();
	if (!session || parseRole(session.user.role) !== "admin") {
		throw new AdminAccessError();
	}
	return session;
}
