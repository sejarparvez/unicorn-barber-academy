// src/server/session.ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
// Server-only session accessor for TanStack Start loaders/beforeLoad.
//
// better-auth speaks web-standard Request/Response; the incoming request is
// available inside server functions via getRequest(). Reading the session
// here — instead of relying on the browser client during SSR — means the
// header renders the correct signed-in/out state on the first paint (no
// hydration flicker), because cookies are forwarded with the request.
import { parseRole } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
import { auth } from "@/server/auth";

/**
 * Server-only session resolver underlying the `getSession` server function.
 * Guards route through this directly so an authoritative (database-backed)
 * read can be forced for sensitive mutations without an extra server-function
 * hop.
 *
 * `returnHeaders` surfaces the refreshed `session_data` cookie cache header on
 * the response. TanStack Start does NOT forward better-auth Set-Cookie
 * automatically for server-function calls, so without forwarding it the cookie
 * cache would silently never refresh on the client and every getSession would
 * fall back to a database read.
 */
export async function resolveSession(options?: {
	authoritative?: boolean;
}): Promise<SessionPayload | null> {
	const result = await auth.api.getSession({
		headers: getRequest().headers,
		query: options?.authoritative ? { disableCookieCache: true } : undefined,
		returnHeaders: true,
	});

	const cookies = result?.headers?.getSetCookie?.() ?? [];
	if (cookies.length > 0) {
		setResponseHeader("Set-Cookie", cookies);
	}

	const session = result?.response ?? null;
	if (!session) return null;
	return {
		user: {
			id: String(session.user.id),
			name: session.user.name ?? "",
			email: session.user.email,
			image: session.user.image ?? null,
			emailVerified: Boolean(session.user.emailVerified),
			// Runtime-validated against the Role union so a stray DB value
			// can never leak an untyped string into the client.
			role: parseRole(session.user.role as string),
		},
		session: {
			id: String(session.session.id),
			expiresAt: new Date(session.session.expiresAt).toISOString(),
		},
	};
}

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<SessionPayload | null> => resolveSession(),
);
