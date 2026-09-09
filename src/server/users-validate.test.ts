import { describe, expect, test } from "bun:test";
import {
	parseBanChange,
	parseRoleChange,
	parseUserListFilters,
} from "@/server/users-validate";

describe("parseUserListFilters", () => {
	test("defaults to page 1 with no filters", () => {
		const result = parseUserListFilters({});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.page).toBe(1);
			expect(result.value.role).toBeUndefined();
		}
	});

	test("accepts role + search + banned", () => {
		const result = parseUserListFilters({
			search: "sejar",
			role: "admin",
			banned: "true",
			page: 2,
		});
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.role).toBe("admin");
			expect(result.value.banned).toBe(true);
			expect(result.value.page).toBe(2);
		}
	});

	test("rejects unknown roles", () => {
		expect(parseUserListFilters({ role: "superadmin" }).ok).toBe(false);
	});
});

describe("parseRoleChange", () => {
	test("accepts a valid change", () => {
		const result = parseRoleChange({ targetId: 3, role: "instructor" });
		expect(result.ok).toBe(true);
	});

	test("rejects bad ids and roles", () => {
		expect(parseRoleChange({ targetId: 0, role: "admin" }).ok).toBe(false);
		expect(parseRoleChange({ targetId: 3, role: "owner" }).ok).toBe(false);
	});
});

describe("parseBanChange", () => {
	test("ban requires a reason", () => {
		expect(
			parseBanChange({ targetId: 3, banned: true, banReason: "" }).ok,
		).toBe(false);
		const ok = parseBanChange({
			targetId: 3,
			banned: true,
			banReason: "spam",
			banExpiresDays: 30,
		});
		expect(ok.ok).toBe(true);
	});

	test("unban needs no reason", () => {
		expect(parseBanChange({ targetId: 3, banned: false }).ok).toBe(true);
	});

	test("rejects garbage expiry", () => {
		expect(
			parseBanChange({
				targetId: 3,
				banned: true,
				banReason: "x",
				banExpiresDays: 99999,
			}).ok,
		).toBe(false);
	});
});
