// src/lib/auth-client.ts
// Browser-side better-auth client, mounted against the Nitro catch-all in
// src/routes/api/auth/$.tsx.
//
// baseURL must be ABSOLUTE: better-auth validates it with `new URL()` and a
// bare "/api/auth" throws during SSR module evaluation. Resolve per-environment:
// - Browser: current origin.
// - Server (SSR of <Header/> which renders useSession()): BETTER_AUTH_URL,
//   falling back to local dev. Client bundle never executes this branch
//   (import.meta.env.SSR is statically true/false), so `process.env` is safe.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.SSR
		? new URL(
				"/api/auth",
				process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
			).toString()
		: new URL("/api/auth", window.location.origin).toString(),
});
