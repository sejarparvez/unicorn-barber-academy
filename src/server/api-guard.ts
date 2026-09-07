// src/server/api-guard.ts
// Shared guard helpers for /api/* route handlers. Consolidates the
// isSameOrigin + overRateLimit pattern duplicated across public endpoints.
import { json } from "@tanstack/react-start";
import { parseRole } from "@/lib/roles";
import { auth } from "@/server/auth";
import { isSameOrigin, overRateLimit } from "@/server/rate-limit";

type GuardResult = { ok: true } | { ok: false; response: Response };

/**
 * CSRF + rate-limit guard for unauthenticated POST endpoints.
 * Returns a pre-built Response on failure, or { ok: true } to continue.
 */
export function guardPublicEndpoint(
	request: Request,
	opts: { rateKey: string; rateMax: number; rateWindowMs: number },
): GuardResult {
	if (!isSameOrigin(request)) {
		return {
			ok: false,
			response: json({ message: "Forbidden" }, { status: 403 }),
		};
	}
	if (overRateLimit(opts.rateKey, opts.rateMax, opts.rateWindowMs)) {
		return {
			ok: false,
			response: json(
				{ message: "Too many requests. Please try again later." },
				{ status: 429 },
			),
		};
	}
	return { ok: true };
}

type AuthenticatedGuardResult =
	| {
			ok: true;
			userId: string;
			userEmail: string;
			userRole: string;
			userImage: string | null;
	  }
	| { ok: false; response: Response };

/**
 * CSRF + session + rate-limit guard for authenticated endpoints.
 * Returns the session info on success, or a Response on failure.
 */
export async function guardAuthenticatedEndpoint(
	request: Request,
	opts: { rateKey: string; rateMax: number; rateWindowMs: number },
): Promise<AuthenticatedGuardResult> {
	if (!isSameOrigin(request)) {
		return {
			ok: false,
			response: json({ message: "Forbidden" }, { status: 403 }),
		};
	}

	let session: Awaited<ReturnType<typeof auth.api.getSession>>;
	try {
		session = await auth.api.getSession({ headers: request.headers });
	} catch {
		return {
			ok: false,
			response: json({ message: "Unauthorized" }, { status: 401 }),
		};
	}

	if (!session || !parseRole(session.user.role as string)) {
		return {
			ok: false,
			response: json({ message: "Sign in required" }, { status: 401 }),
		};
	}

	const rateKey = `${opts.rateKey}:${session.user.id}`;
	if (overRateLimit(rateKey, opts.rateMax, opts.rateWindowMs)) {
		return {
			ok: false,
			response: json(
				{ message: "Too many requests. Please wait a minute." },
				{ status: 429 },
			),
		};
	}

	return {
		ok: true,
		userId: String(session.user.id),
		userEmail: session.user.email,
		userRole: session.user.role as string,
		userImage: (session.user.image as string | null) ?? null,
	};
}
