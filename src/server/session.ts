// src/server/session.ts
// Client-safe session server function. All the request/cookie mechanics live
// in session-core.server.ts; this module exports only a createServerFn, so on
// the client it compiles down to a thin RPC stub and the server-only imports
// never reach the browser bundle.
import { createServerFn } from "@tanstack/react-start";

import type { SessionPayload } from "@/lib/types";
import { resolveSession } from "./session-core.server";

export const getSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<SessionPayload | null> => resolveSession(),
);
