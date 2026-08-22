// src/lib/server-session.ts
// Server-only session accessor for TanStack Start loaders/beforeLoad.
//
// better-auth speaks web-standard Request/Response; the incoming request is
// available inside server functions via getRequest(). Reading the session
// here — instead of relying on the browser client during SSR — means the
// header renders the correct signed-in/out state on the first paint (no
// hydration flicker), because cookies are forwarded with the request.
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export type SessionPayload = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
		role?: string;
	};
	session: {
		id: string;
		expiresAt: string;
	};
} | null;

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<SessionPayload> => {
		const result = await auth.api.getSession({ headers: getRequest().headers });
		if (!result) return null;
		return {
			user: {
				id: String(result.user.id),
				name: result.user.name ?? "",
				email: result.user.email,
				image: result.user.image ?? null,
				emailVerified: Boolean(result.user.emailVerified),
				role:
					typeof result.user.role === "string" ? result.user.role : undefined,
			},
			session: {
				id: String(result.session.id),
				expiresAt: new Date(result.session.expiresAt).toISOString(),
			},
		};
	},
);
