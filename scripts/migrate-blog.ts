// scripts/migrate-blog.ts
// Applies every scripts/sql/*.sql file (sorted by name) against DATABASE_URL.
// All migrations are written idempotently (IF NOT EXISTS / guarded), so this
// is safe to re-run after pulls or partial applies.
//
// Usage:
//   bun run db:blog
//
// Run from the repo root with DATABASE_URL present in .env (same Neon SSL
// requirements as src/server/auth.ts).
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const sqlDir = join(import.meta.dir, "sql");
const files = readdirSync(sqlDir)
	.filter((f) => f.endsWith(".sql"))
	.sort();

if (files.length === 0) {
	console.log("db:blog → no .sql files found in scripts/sql");
	process.exit(0);
}

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	// Verified working with Neon's chain via system CAs (see auth.ts).
	ssl:
		process.env.DATABASE_SSL_CA
			? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
			: { rejectUnauthorized: true },
	max: 1,
});

let failed = false;
try {
	for (const file of files) {
		const sql = readFileSync(join(sqlDir, file), "utf8");
		try {
			await pool.query("BEGIN");
			await pool.query(sql);
			await pool.query("COMMIT");
			console.log(`db:blog → applied ${file}`);
		} catch (error) {
			await pool.query("ROLLBACK");
			console.error(`db:blog → FAILED ${file}:`, error);
			failed = true;
			break;
		}
	}
} finally {
	await pool.end();
}

if (failed) process.exit(1);
console.log(`db:blog → done (${files.length} migration${files.length === 1 ? "" : "s"})`);
