import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@/lib/auth";

/**
 * better-auth catch-all: forwards every /api/auth/* request (GET sign-in
 * state endpoints, POST sign-up/sign-in/sign-out, etc.) to the handler,
 * which speaks web-standard Request/Response — a direct pass on Nitro.
 */
export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => auth.handler(request),
			POST: async ({ request }) => auth.handler(request),
		},
	},
});
