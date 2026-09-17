// src/server/session-core.server.ts
// Server-only session resolution. The `.server.ts` suffix is enforced by
// TanStack Start's import-protection plugin: this module can never be imported
// from client code. It is the ONLY place in the app that touches
// getRequest/setResponseHeader (@tanstack/react-start/server).
//
// It must stay that way: route beforeLoad guards, loaders, and components are
// bundled into the browser, so they may only reach the session through the
// getSession server function from session.ts (a createServerFn that is
// replaced with a thin RPC stub on the client).
//
// resolveSession reads the incoming request cookies via getRequest() and
// forwards better-auth's refreshed `session_data` cookie-cache Set-Cookie
// headers so the cookie stays warm across every RPC call.
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

import { parseRole } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
import { auth } from "./auth";

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
