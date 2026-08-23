import { describe, expect, test } from "bun:test";
import { safeRedirect } from "./redirect";

describe("safeRedirect", () => {
	test("keeps valid internal paths", () => {
		expect(safeRedirect("/dashboard")).toBe("/dashboard");
		expect(safeRedirect("/programs/barbering?ref=nav")).toBe(
			"/programs/barbering?ref=nav",
		);
		expect(safeRedirect("/auth/signin")).toBe("/auth/signin");
	});

	test("falls back for empty or non-string values", () => {
		expect(safeRedirect(undefined)).toBe("/");
		expect(safeRedirect(null)).toBe("/");
		expect(safeRedirect("")).toBe("/");
	});

	test("rejects absolute URLs", () => {
		expect(safeRedirect("https://evil.com")).toBe("/");
		expect(safeRedirect("http://evil.com/path")).toBe("/");
		expect(safeRedirect("javascript:alert(1)")).toBe("/");
	});

	test("rejects protocol-relative URLs", () => {
		expect(safeRedirect("//evil.com")).toBe("/");
		expect(safeRedirect("//evil.com/path")).toBe("/");
	});

	test("rejects backslash tricks", () => {
		expect(safeRedirect("/\\evil.com")).toBe("/");
		expect(safeRedirect("\\\\evil.com")).toBe("/");
	});

	test("rejects control characters", () => {
		expect(safeRedirect("/ok\r\nSet-Cookie: x=1")).toBe("/");
		expect(safeRedirect("/a\u0000b")).toBe("/");
		expect(safeRedirect("/tab\tinjected")).toBe("/");
	});

	test("honours custom fallback", () => {
		expect(safeRedirect("//evil.com", "/enroll")).toBe("/enroll");
	});
});
