// src/server/db.ts
// Server-only: shared pg Pool for application-owned tables (blog_*). The
// better-auth tables are owned by the pool inside src/server/auth.ts — that
// one stays untouched; this pool simply follows the same connection rules.
//
// Prisma-next mirrors these schemas in prisma/schema.prisma as contract
// documentation only. Do not point a Prisma client at writes here either:
// one engine per table, same rule as the auth comment in auth.ts.
import "dotenv/config";
import { Pool } from "pg";

let pool: Pool | null = null;

export function db(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: process.env.DATABASE_URL,
			// Verified working with Neon's chain via system CAs (see auth.ts).
			ssl: process.env.DATABASE_SSL_CA
				? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
				: { rejectUnauthorized: true }, // Required for Neon SSL termination
			// Blog traffic is low-volume admin CRUD + cached public reads;
			// a small pool keeps serverless/Neon connection counts happy.
			max: 5,
		});
	}
	return pool;
}

/** Thin tagged helper so call sites stay terse and uniformly awaited. */
export function q<T extends Record<string, unknown>>(
	text: string,
	params?: unknown[],
): Promise<{ rows: T[]; rowCount: number | null }> {
	return db().query(text, params);
}

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
	throw new Error("DATABASE_URL is not set — cannot serve blog content.");
}
