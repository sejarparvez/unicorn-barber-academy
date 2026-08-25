// src/server/db-health.test.ts
// Read-only smoke test: verifies DATABASE_URL actually connects and that
// every table the app owns exists with expected constraints. Skipped when
// no DATABASE_URL is configured (CI without secrets) — never writes.
import { describe, expect, test } from "bun:test";
import { q } from "@/server/db";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("database connectivity (read-only)", () => {
	const t = test.skipIf(!hasDb);

	t("SELECT 1 works", async () => {
		const res = await q<{ ok: number }>("SELECT 1 AS ok");
		expect(res.rows[0]?.ok).toBe(1);
	});

	t("application tables exist", async () => {
		const res = await q<{ table_name: string }>(
			`SELECT table_name FROM information_schema.tables
			 WHERE table_schema = 'public'
			 AND table_name IN ('blog_post', 'blog_category', 'enrollment_application',
			 'program_intake', 'certificate')`,
		);
		const names = new Set(res.rows.map((r) => r.table_name));
		for (const table of [
			"blog_post",
			"blog_category",
			"enrollment_application",
			"program_intake",
			"certificate",
		]) {
			expect(names.has(table), `missing table: ${table}`).toBe(true);
		}
	});

	t("application status CHECK includes 'completed'", async () => {
		const res = await q<{ check_clause: string }>(
			`SELECT pg_get_constraintdef(c.oid) AS check_clause
			 FROM pg_constraint c
			 JOIN pg_class t ON t.oid = c.conrelid
			 WHERE t.relname = 'enrollment_application' AND c.contype = 'c'`,
		);
		const all = res.rows.map((r) => r.check_clause).join(" ");
		expect(all).toContain("'completed'");
	});

	t("certificate code uniqueness constraint exists", async () => {
		const res = await q<{ indexdef: string }>(
			`SELECT indexdef FROM pg_indexes WHERE tablename = 'certificate'`,
		);
		const defs = res.rows.map((r) => r.indexdef).join("\n");
		expect(defs).toContain("UNIQUE");
	});
});
