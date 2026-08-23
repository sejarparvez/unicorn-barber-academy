// scripts/set-role.ts
// Assign any academy role to an account. better-auth stores user.role as
// plain text; the valid values are defined in src/lib/roles.ts:
//   user       — registered, not enrolled (signup default)
//   student    — has at least one enrollment
//   instructor — teaching staff
//   admin      — management (better-auth admin() plugin)
//
// Usage:
//   bun scripts/set-role.ts user@example.com student
//   bun scripts/set-role.ts user@example.com admin
//
// Run from the repo root with DATABASE_URL present in .env.
import "dotenv/config";
import pg from "pg";

const ROLES = ["user", "student", "instructor", "admin"];

const email = process.argv[2]?.trim().toLowerCase();
const role = process.argv[3]?.trim().toLowerCase();

if (!email || !role) {
	console.error(
		"Usage: bun scripts/set-role.ts <user@example.com> <user|student|instructor|admin>",
	);
	process.exit(1);
}
if (!ROLES.includes(role)) {
	console.error(
		`Unknown role "${role}". Valid roles: ${ROLES.join(", ")}`,
	);
	process.exit(1);
}

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
