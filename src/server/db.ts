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

type TxClient = {
	query: <R extends Record<string, unknown>>(
		text: string,
		params?: unknown[],
	) => Promise<{ rows: R[]; rowCount: number | null }>;
};

/**
 * Run multi-statement DB work atomically: BEGIN → fn(tx) → COMMIT, with
 * ROLLBACK + rethrow on failure. Use for any write that spans several
 * statements so a crash can never leave half-applied state behind.
 */
export async function withTransaction<T>(
	fn: (tx: TxClient) => Promise<T>,
): Promise<T> {
	const client = await db().connect();
	try {
		await client.query("BEGIN");
		const result = await fn(client);
		await client.query("COMMIT");
		return result;
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
}

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
	throw new Error("DATABASE_URL is not set — cannot serve blog content.");
}
