// src/server/admin-guard.server.ts
// Server-only in-handler guard for privileged createServerFn endpoints.
//
// Split out of guards.ts (which routes import on the client) because this
// path needs the authoritative database-backed session read from
// session-core.server — a module the import-protection plugin keeps strictly
// server-side. Everything here runs inside server-fn handlers; a route-level
// beforeLoad guard does NOT protect the compiled RPC endpoints.
//
// Pass `authoritative: true` from mutation handlers so the role/ban read
// bypasses the cookie-cache and hits the database — a demoted or banned admin
// must not keep write access until the cache cookie expires.
import { parseRole } from "@/lib/roles";
import type { SessionPayload } from "@/lib/types";
import { AdminAccessError } from "./admin-access-error";
import { getSession } from "./session";
import { resolveSession } from "./session-core.server";

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
