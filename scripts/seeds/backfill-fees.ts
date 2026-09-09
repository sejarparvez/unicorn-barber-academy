// scripts/backfill-fees.ts — one-time: ledger rows for applications already
// flagged paid under the old manual toggle, so derivation keeps them paid.
// Safe to re-run (skips applications that already have ledger rows).
// Usage: bun scripts/backfill-fees.ts
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL_CA
		? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
		: { rejectUnauthorized: true },
	max: 1,
});

const res = await pool.query<{ id: number; fee: number }>(
	`SELECT a.id, coalesce(p.fee_poisha, 0) AS fee
	 FROM enrollment_application a
	 JOIN program_intake i ON i.id = a.intake_id
	 LEFT JOIN program p ON p.slug = i.program_slug
	 WHERE a.fee_status = 'paid'
	   AND NOT EXISTS (SELECT 1 FROM fee_payment f WHERE f.application_id = a.id)`,
);
let count = 0;
for (const row of res.rows) {
	await pool.query(
		`INSERT INTO fee_payment
			(application_id, amount_poisha, method, receipt_ref, received_by, paid_at)
		 VALUES ($1, $2, 'cash', 'MIGRATION', NULL, now())`,
		[row.id, row.fee],
	);
	count++;
}
console.log(`backfill-fees → inserted ${count} ledger rows`);
await pool.end();
