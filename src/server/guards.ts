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
 * In-handler guard for createServerFn endpoints. Route beforeLoad guards do
 * NOT protect server functions — each compiled server fn is its own public
 * RPC endpoint — so any privileged fn must call this inside its handler.
 */
export async function requireAdminSession(): Promise<SessionPayload> {
	const session = await getSession();
	if (!session || parseRole(session.user.role) !== "admin") {
		throw new AdminAccessError();
	}
	return session;
}
