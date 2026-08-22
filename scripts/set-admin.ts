// scripts/set-admin.ts
// Promotes a user to the admin role (better-auth `admin` plugin).
//
// Usage:
//   bun scripts/set-admin.ts user@example.com
//
// Run from the repo root with DATABASE_URL present in .env. Demote by passing
// "user" instead of "admin" via DEMOTE=1 bun scripts/set-admin.ts <email>.
import "dotenv/config";
import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
	console.error("Usage: bun scripts/set-admin.ts <user@example.com>");
	process.exit(1);
}

const role = process.env.DEMOTE === "1" ? "user" : "admin";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: true },
	max: 1,
});

try {
	const res = await pool.query(
		'UPDATE "user" SET role = $1, "updatedAt" = now() WHERE lower(email) = $2 RETURNING id, email, role',
		[role, email],
	);
	if (res.rowCount === 0) {
		console.error(`No user found with email ${email}`);
		process.exitCode = 1;
	} else {
		console.log(`Updated: ${JSON.stringify(res.rows[0])}`);
	}
} finally {
	await pool.end();
}
