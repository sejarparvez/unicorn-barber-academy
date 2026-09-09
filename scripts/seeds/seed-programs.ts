// scripts/seed-programs.ts
// One-time seed: imports the hardcoded catalog (src/data/programs.ts) into
// the program table. Safe to re-run (upserts by slug).
// Usage: bun scripts/seed-programs.ts
import "dotenv/config";
import pg from "pg";
import { ALL_PROGRAMS } from "@/data/programs";

function tuitionToPoisha(tuition: string): number {
	const digits = tuition.replace(/[^0-9]/g, "");
	return digits ? Number.parseInt(digits, 10) * 100 : 0;
}

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL_CA
		? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
		: { rejectUnauthorized: true },
	max: 1,
});

let count = 0;
for (const p of ALL_PROGRAMS) {
	await pool.query(
		`INSERT INTO program (slug, title, track, duration, fee_poisha, default_seats, is_published, updated_at)
		 VALUES ($1, $2, $3, $4, $5, 12, TRUE, now())
		 ON CONFLICT (slug) DO UPDATE SET
			title = EXCLUDED.title, track = EXCLUDED.track,
			duration = EXCLUDED.duration, fee_poisha = EXCLUDED.fee_poisha,
			updated_at = now()`,
		[p.slug, p.title, p.track, p.duration, tuitionToPoisha(p.tuition)],
	);
	count++;
}
console.log(`seed-programs → upserted ${count} programs`);
await pool.end();
