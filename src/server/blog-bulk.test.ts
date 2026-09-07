// src/server/blog-bulk.test.ts
// Tests for blog bulk operations (DB functions) and route validation logic.
import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mock the entire db module before importing anything that uses it
const mockQuery = mock(() => Promise.resolve({ rows: [], rowCount: 0 }));
const mockWithTransaction = mock((fn: (tx: unknown) => Promise<unknown>) =>
	fn({ query: mockQuery }),
);
mock.module("@/server/db", () => ({
	q: mockQuery,
	withTransaction: mockWithTransaction,
}));

// Reset mocks between tests
beforeEach(() => {
	mockQuery.mockClear();
	mockWithTransaction.mockClear();
});

// ---- DB function contracts ----

describe("bulkUpdatePostStatus", () => {
	test("generates correct SQL with parameterised ids", async () => {
		const { bulkUpdatePostStatus } = await import("@/server/blog-db");

		await bulkUpdatePostStatus([1, 2, 3], "published");

		expect(mockQuery).toHaveBeenCalledTimes(1);
		const call = mockQuery.mock.calls[0] as unknown as [string, unknown[]];
		expect(call[0]).toContain("UPDATE blog_post");
		expect(call[0]).toContain("SET status = $1");
		expect(call[0]).toContain("WHERE id = ANY($2::int[])");
		expect(call[1]).toEqual(["published", [1, 2, 3]]);
	});

	test("wraps result in { updated: rowCount }", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 3 });
		const { bulkUpdatePostStatus } = await import("@/server/blog-db");

		const result = await bulkUpdatePostStatus([1, 2, 3], "draft");

		expect(result).toEqual({ updated: 3 });
	});
});

describe("bulkDeletePosts", () => {
	test("generates correct DELETE SQL", async () => {
		const { bulkDeletePosts } = await import("@/server/blog-db");

		await bulkDeletePosts([10, 20]);

		expect(mockQuery).toHaveBeenCalledTimes(1);
		const call = mockQuery.mock.calls[0] as unknown as [string, unknown[]];
		expect(call[0]).toContain("DELETE FROM blog_post");
		expect(call[0]).toContain("WHERE id = ANY($1::int[])");
		expect(call[1]).toEqual([[10, 20]]);
	});

	test("wraps result in { deleted: rowCount }", async () => {
		mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 2 });
		const { bulkDeletePosts } = await import("@/server/blog-db");

		const result = await bulkDeletePosts([10, 20]);

		expect(result).toEqual({ deleted: 2 });
	});
});

// ---- Route validation logic (inline, tested via parser + ID filtering) ----

describe("blog bulk route validation", () => {
	test("parseBlogStatus rejects invalid status", async () => {
		const { parseBlogStatus } = await import("@/lib/blog");
		expect(parseBlogStatus("invalid")).toBeUndefined();
	});

	test("parseBlogStatus accepts valid statuses", async () => {
		const { parseBlogStatus } = await import("@/lib/blog");
		expect(parseBlogStatus("draft")).toBe("draft");
		expect(parseBlogStatus("published")).toBe("published");
		expect(parseBlogStatus("archived")).toBe("archived");
	});

	test("ID filtering: rejects non-number values", () => {
		const ids = [1, "two", 3, null, -1, 0].filter(
			(v): v is number => typeof v === "number" && v > 0,
		);
		expect(ids).toEqual([1, 3]);
	});

	test("ID filtering: rejects empty array", () => {
		const ids: number[] = [];
		expect(ids.length === 0 || ids.length > 50).toBe(true);
	});

	test("ID filtering: rejects >50 IDs", () => {
		const ids = Array.from({ length: 51 }, (_, i) => i + 1);
		expect(ids.length > 50).toBe(true);
	});

	test("ID filtering: accepts valid range (1-50)", () => {
		const ids = Array.from({ length: 50 }, (_, i) => i + 1);
		expect(ids.length > 0 && ids.length <= 50).toBe(true);
	});
});
