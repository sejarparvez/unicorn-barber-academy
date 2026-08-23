// src/server/admin-api.ts
// Guard for /api/admin/* route handlers. Route-level guards (guards.ts) only
// protect pages — API endpoints must verify the session themselves, exactly
// like api/contact.tsx verifies same-origin.
//
// Three checks, in order: same-origin (CSRF), authenticated session, admin
// role. Returns a discriminated result so handlers can json() the failure.
import { parseRole } from "@/lib/roles";
import { auth } from "@/server/auth";
import { isSameOrigin } from "@/server/rate-limit";

export type AdminGuardResult =
	| { ok: true; userId: number; userEmail: string }
	| { ok: false; status: 401 | 403 | 404; message: string };

export async function requireAdminApi(
	request: Request,
): Promise<AdminGuardResult> {
	if (!isSameOrigin(request)) {
		return { ok: false, status: 403, message: "Forbidden" };
	}

	let session: Awaited<ReturnType<typeof auth.api.getSession>>;
	try {
		session = await auth.api.getSession({ headers: request.headers });
	} catch {
		return { ok: false, status: 401, message: "Unauthorized" };
	}
	if (!session) {
		return { ok: false, status: 401, message: "Sign in required" };
	}
	if (parseRole(session.user.role as string) !== "admin") {
		return { ok: false, status: 403, message: "Admin access required" };
	}

	return {
		ok: true,
		userId: Number(session.user.id),
		userEmail: session.user.email,
	};
}
