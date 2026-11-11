import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
	// `process.env` is not populated in the browser bundle, so the client-side
	// base URL must come from a VITE_-prefixed variable. better-auth appends
	// the default `/api/auth` base path itself, so only the origin is needed.
	baseURL: import.meta.env.VITE_APP_ORIGIN,
	plugins: [adminClient()],
});
