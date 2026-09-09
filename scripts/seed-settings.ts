// scripts/seed-settings.ts — one-time seed of site_setting from data/site.ts.
// Safe to re-run (upserts without overwriting). Usage: bun scripts/seed-settings.ts
import "dotenv/config";
import { defaultBaseValues, type SettingKey } from "@/lib/settings";
import pg from "pg";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_SSL_CA
		? { ca: process.env.DATABASE_SSL_CA, rejectUnauthorized: true }
		: { rejectUnauthorized: true },
	max: 1,
});

const base = defaultBaseValues();
let count = 0;
for (const [key, value] of Object.entries(base) as Array<[SettingKey, string]>) {
	if (key === "announcement_text" || key === "announcement_to") continue;
	await pool.query(
		`INSERT INTO site_setting (key, value, updated_at)
		 VALUES ($1, $2, now())
		 ON CONFLICT (key) DO NOTHING`,
		[key, value],
	);
	count++;
}
console.log(`seed-settings → ensured ${count} keys`);
await pool.end();
