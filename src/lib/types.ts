// src/lib/types.ts
// Shared, client-safe types crossing the server/client boundary. Server
// modules (src/server/**) may re-export values from here; client components
// import the types from here so they never even type-import server code.

import type { Role } from "./roles";

export type SessionPayload = {
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
		/** Typed academy role — validated server-side via parseRole(). */
		role?: Role;
	};
	session: {
		id: string;
		expiresAt: string;
	};
};
