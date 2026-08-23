// src/lib/auth-client.ts
// Browser-side better-auth client, mounted against the Nitro catch-all in
// src/routes/api/auth/$.tsx. The admin client plugin mirrors the server
// plugin in src/server/auth.ts so session.user.role is fully typed.
//
// baseURL must be ABSOLUTE: better-auth validates it with `new URL()` and a
// bare "/api/auth" throws during SSR module evaluation. APP_ORIGIN (lib/env)
// resolves per-environment: current origin in the browser, BETTER_AUTH_URL
// on the server. Note: SSR pages read the session through
// src/server/session.ts instead of this client, because a server-side fetch
// cannot see the visitor's cookies.
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { APP_ORIGIN } from "@/lib/env";

export const authClient = createAuthClient({
	baseURL: `${APP_ORIGIN}/api/auth`,
	plugins: [adminClient()],
});
