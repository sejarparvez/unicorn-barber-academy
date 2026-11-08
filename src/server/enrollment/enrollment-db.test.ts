// src/server/enrollment/enrollment-db.test.ts
// Read-only regression tests for admin application filters. Skipped when no
// DATABASE_URL is configured — these never write.
import { describe, expect, test } from "bun:test";
import { listApplicationsAdmin } from "./enrollment-db";

const hasDb = Boolean(process.env.DATABASE_URL);

describe("listApplicationsAdmin filters (read-only)", () => {
	const t = test.skipIf(!hasDb);
	const filters = { page: 1, perPage: 5 } as const;

	t("program filter runs against both count and row queries", async () => {
		const result = await listApplicationsAdmin({
			...filters,
			programSlug: "barbering-fundamentals",
		});
		expect(Array.isArray(result.items)).toBe(true);
		expect(result.total).toBeGreaterThanOrEqual(result.items.length);
	});

	t("cohort filter runs against both count and row queries", async () => {
		const result = await listApplicationsAdmin({ ...filters, cohort: "day" });
		expect(Array.isArray(result.items)).toBe(true);
		expect(result.total).toBeGreaterThanOrEqual(result.items.length);
	});

	t("program and cohort filters can be combined", async () => {
		const result = await listApplicationsAdmin({
			...filters,
			programSlug: "barbering-fundamentals",
			cohort: "evening",
		});
		expect(Array.isArray(result.items)).toBe(true);
		expect(result.total).toBeGreaterThanOrEqual(result.items.length);
	});

	t("search terms with LIKE metacharacters do not error", async () => {
		for (const search of ["%", "_", "\\", "100%"]) {
			const result = await listApplicationsAdmin({ ...filters, search });
			expect(Array.isArray(result.items)).toBe(true);
		}
	});
});
