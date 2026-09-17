// src/lib/session-cache.ts
// Client-only, short-TTL cache for the resolved session so route beforeLoad
// guards don't round-trip to the server on every client-side navigation.
//
// TanStack Router runs beforeLoad serially parent → child before any loaders,
// and re-runs it on every navigation (+ hover preloads). That makes an
// awaited server function in a layout guard a blocking network RTT per click.
// The server-side cookie cache removed the DB work but not that round-trip.
//
// This module closes the gap: the root route resolves the session once per
// TTL window (60s, intentionally shorter than the server cookie-cache window
// so revocations revalidate quickly) and every descendant guard reads the
// result from the already-merged context synchronously.
//
// The server NEVER reads or writes this cache — SSR must stay fresh, and a
// module-level cache would leak between requests. Remove the stale entry on
// sign-in/sign-out so a previous identity can't ride the TTL.
import type { SessionPayload } from "@/lib/types";

const TTL_MS = 60_000;

let cached: { session: SessionPayload | null; at: number } | null = null;

const isClient = () => typeof window !== "undefined";

export function getCachedSession(): SessionPayload | null | undefined {
	if (!isClient() || !cached) return undefined;
	if (Date.now() - cached.at > TTL_MS) return undefined;
	return cached.session;
}

export function setCachedSession(session: SessionPayload | null): void {
	if (!isClient()) return;
	cached = { session, at: Date.now() };
}

export function clearCachedSession(): void {
	cached = null;
}
