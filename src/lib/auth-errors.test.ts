// src/lib/auth-errors.test.ts
import { describe, expect, test } from "bun:test";
import { friendlyAuthError } from "@/lib/auth-errors";

describe("friendlyAuthError", () => {
	test("returns generic message for null", () => {
		expect(friendlyAuthError(null)).toBe(
			"Something went wrong. Please try again.",
		);
	});

	test("returns generic message for undefined", () => {
		expect(friendlyAuthError(undefined)).toBe(
			"Something went wrong. Please try again.",
		);
	});

	test("returns generic message for empty string", () => {
		expect(friendlyAuthError("")).toBe(
			"Something went wrong. Please try again.",
		);
	});

	test("maps provider/config errors to Google message", () => {
		expect(friendlyAuthError("provider not configured")).toBe(
			"Google sign-in isn't configured yet — please use email and password.",
		);
	});

	test("maps 'invalid oauth' to Google message", () => {
		expect(friendlyAuthError("invalid oauth configuration")).toBe(
			"Google sign-in isn't configured yet — please use email and password.",
		);
	});

	test("maps 'unsupported provider' to Google message", () => {
		expect(friendlyAuthError("unsupported provider")).toBe(
			"Google sign-in isn't configured yet — please use email and password.",
		);
	});

	test("maps popup/cancel errors to popup message", () => {
		expect(friendlyAuthError("popup closed by user")).toBe(
			"The Google window closed before finishing. Please try again.",
		);
	});

	test("maps 'cancel' to popup message", () => {
		expect(friendlyAuthError("user cancelled")).toBe(
			"The Google window closed before finishing. Please try again.",
		);
	});

	test("maps 'abort' to popup message", () => {
		expect(friendlyAuthError("request aborted")).toBe(
			"The Google window closed before finishing. Please try again.",
		);
	});

	test("passes through unrecognized messages unchanged", () => {
		expect(friendlyAuthError("rate limit exceeded")).toBe(
			"rate limit exceeded",
		);
	});

	test("case insensitive matching", () => {
		expect(friendlyAuthError("PROVIDER NOT CONFIGURED")).toBe(
			"Google sign-in isn't configured yet — please use email and password.",
		);
	});
});
