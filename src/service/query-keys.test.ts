// src/service/query-keys.test.ts
import { describe, expect, test } from "bun:test";
import { queryKeys } from "@/service/query-keys";

describe("queryKeys", () => {
	describe("enrollment", () => {
		test("applications() returns array with empty object", () => {
			const key = queryKeys.applications();
			expect(key).toEqual(["applications", {}]);
		});

		test("applications() with filters includes filter object", () => {
			const key = queryKeys.applications({ status: "pending", page: 2 });
			expect(key[0]).toBe("applications");
			expect(key[1]).toEqual({ status: "pending", page: 2 });
		});

		test("application(id) nests under applications scope", () => {
			const key = queryKeys.application(42);
			expect(key).toEqual(["applications", "detail", 42]);
		});

		test("applicationLog(id) nests under application detail", () => {
			const key = queryKeys.applicationLog(42);
			expect(key).toEqual(["applications", "detail", 42, "log"]);
		});

		test("applicationLog key shares parent scope for invalidation", () => {
			const detail = queryKeys.application(7);
			const log = queryKeys.applicationLog(7);
			expect(log[0]).toBe(detail[0]);
			expect(log[1]).toBe(detail[1]);
			expect(log[2]).toBe(detail[2]);
		});

		test("intakes() returns scope array", () => {
			expect(queryKeys.intakes()).toEqual(["intakes"]);
		});

		test("myApplications() returns scope array", () => {
			expect(queryKeys.myApplications()).toEqual(["my-applications"]);
		});

		test("openIntakes() returns scope array", () => {
			expect(queryKeys.openIntakes()).toEqual(["open-intakes"]);
		});
	});

	describe("certificates", () => {
		test("certificates() returns scope array", () => {
			expect(queryKeys.certificates()).toEqual(["certificates"]);
		});

		test("certificate(id) nests under certificates scope", () => {
			const key = queryKeys.certificate(7);
			expect(key).toEqual(["certificates", "detail", 7]);
		});

		test("applicationCertificate() nests under certificates scope", () => {
			const key = queryKeys.applicationCertificate(99);
			expect(key).toEqual(["certificates", "application", 99]);
		});
	});

	describe("console", () => {
		test("consoleOverview() returns scope array", () => {
			expect(queryKeys.consoleOverview()).toEqual(["console-overview"]);
		});
	});

	describe("blog", () => {
		test("adminPosts() returns array with empty object", () => {
			const key = queryKeys.adminPosts();
			expect(key).toEqual(["admin-posts", {}]);
		});

		test("adminPosts() with filters includes filter object", () => {
			const key = queryKeys.adminPosts({ status: "draft", search: "hello" });
			expect(key[0]).toBe("admin-posts");
			expect(key[1]).toEqual({ status: "draft", search: "hello" });
		});

		test("adminPost(id) nests under admin-posts scope", () => {
			const key = queryKeys.adminPost(5);
			expect(key).toEqual(["admin-posts", "detail", 5]);
		});

		test("blogCategories() returns scope array", () => {
			expect(queryKeys.blogCategories()).toEqual(["blog-categories"]);
		});
	});

	describe("hierarchy", () => {
		test("detail keys share parent scope for invalidation", () => {
			const list = queryKeys.applications({ status: "pending" });
			const detail = queryKeys.application(1);
			expect(list[0]).toBe(detail[0]);
		});

		test("blog detail keys share parent scope", () => {
			const list = queryKeys.adminPosts();
			const detail = queryKeys.adminPost(1);
			expect(list[0]).toBe(detail[0]);
		});
	});
});
