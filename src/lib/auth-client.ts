// src/lib/auth-client.ts
// Browser-side better-auth client, mounted against the Nitro catch-all in
// src/routes/api/auth/$.tsx. The admin client plugin mirrors the server
// plugin in src/lib/auth.ts so session.user.role is fully typed.
//
// baseURL must be ABSOLUTE: better-auth validates it with `new URL()` and a
// bare "/api/auth" throws during SSR module evaluation. Resolve per-environment:
// - Browser: current origin.
// - Server: BETTER_AUTH_URL, falling back to local dev. Client bundle never
//   executes this branch (import.meta.env.SSR is statically true/false), so
//   `process.env` is safe. Note: SSR pages read the session through
//   src/lib/server-session.ts instead of this client, because a server-side
//   fetch cannot see the visitor's cookies.
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.SSR
		? new URL(
				"/api/auth",
				process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
			).toString()
		: new URL("/api/auth", window.location.origin).toString(),
	plugins: [adminClient()],
});
