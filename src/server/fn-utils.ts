// src/server/fn-utils.ts
// Shared hardening helpers for *-fns.ts server functions. Server fns are
// public RPC endpoints: every handler must (1) clamp untrusted inputs to
// safe shapes, and (2) never let raw driver errors cross the wire.
// Role enforcement lives in guards.ts (requireAdminSession).
import { AdminAccessError } from "./admin-access-error";

/** Coerce an untrusted page param to a sane 1..10000 integer. */
export function clampPage(page: unknown): number {
	const n = typeof page === "number" ? Math.trunc(page) : Number.NaN;
	return Number.isInteger(n) && n >= 1 ? Math.min(n, 10_000) : 1;
}

/**
 * Coerce an untrusted numeric id. Returns 0 for garbage so callers can
 * treat it as "not found" instead of feeding NaN into a query.
 */
export function clampId(id: unknown): number {
	const n = typeof id === "number" ? Math.trunc(id) : Number.NaN;
	return Number.isInteger(n) && n >= 1 && n <= 2_147_483_647 ? n : 0;
}

/** Cap a free-text search term before it reaches ILIKE clauses. */
export function clampSearchTerm(term: unknown, max = 100): string {
	return typeof term === "string" ? term.slice(0, max) : "";
}

/**
 * Run DB work behind a catch-all: log the real error server-side, rethrow
 * a generic message so pg driver details never reach the client.
 */
export async function runSafe<T>(fn: () => Promise<T>): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		// Authz failures carry a safe, intentional message — let them through
		// so clients can react (e.g. redirect) instead of showing "failed".
		if (error instanceof AdminAccessError) throw error;
		// TanStack Router redirects (thrown in beforeLoad) must propagate.
		if (
			error &&
			typeof error === "object" &&
			"statusCode" in error &&
			"redirect" in error
		) {
			throw error;
		}
		console.error("[server-function]", error);
		throw new Error("Request failed");
	}
}
