// src/server/session.ts
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
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

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<SessionPayload | null> => {
		const result = await auth.api.getSession({ headers: getRequest().headers });
		if (!result) return null;
		return {
			user: {
				id: String(result.user.id),
				name: result.user.name ?? "",
				email: result.user.email,
				image: result.user.image ?? null,
				emailVerified: Boolean(result.user.emailVerified),
				// Runtime-validated against the Role union so a stray DB value
				// can never leak an untyped string into the client.
				role: parseRole(result.user.role as string),
			},
			session: {
				id: String(result.session.id),
				expiresAt: new Date(result.session.expiresAt).toISOString(),
			},
		};
	},
);
