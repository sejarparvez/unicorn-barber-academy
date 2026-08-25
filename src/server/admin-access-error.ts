// src/server/admin-access-error.ts
// Leaf module (no imports) so both guards.ts and fn-utils.ts can share the
// tagged authz error without pulling session/env into lightweight contexts.

/**
 * Thrown by requireAdminSession. Tagged so runSafe can pass the benign
 * message through to the client instead of a generic "Request failed" —
 * letting the UI distinguish "not allowed" from "something broke" without
 * leaking driver details.
 */
export class AdminAccessError extends Error {
	constructor() {
		super("Admin access required");
		this.name = "AdminAccessError";
	}
}
