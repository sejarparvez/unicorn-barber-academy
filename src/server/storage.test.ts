// src/server/storage.test.ts
import { describe, expect, test } from "bun:test";
import {
	isAllowedImageMime,
	keyFromUrl,
	MAX_UPLOAD_BYTES,
	StorageNotConfiguredError,
	sniffImageMime,
} from "@/server/storage";

describe("isAllowedImageMime", () => {
	test("allows listed image types", () => {
		expect(isAllowedImageMime("image/jpeg")).toBe(true);
		expect(isAllowedImageMime("image/png")).toBe(true);
		expect(isAllowedImageMime("image/webp")).toBe(true);
		expect(isAllowedImageMime("image/avif")).toBe(true);
		expect(isAllowedImageMime("image/gif")).toBe(true);
	});

	test("rejects unlisted types", () => {
		expect(isAllowedImageMime("image/svg+xml")).toBe(false);
		expect(isAllowedImageMime("image/bmp")).toBe(false);
		expect(isAllowedImageMime("application/pdf")).toBe(false);
		expect(isAllowedImageMime("text/html")).toBe(false);
		expect(isAllowedImageMime("")).toBe(false);
	});
});

describe("sniffImageMime", () => {
	test("detects JPEG from magic bytes", () => {
		const buf = Buffer.alloc(12);
		buf[0] = 0xff;
		buf[1] = 0xd8;
		buf[2] = 0xff;
		expect(sniffImageMime(buf)).toBe("image/jpeg");
	});

	test("detects PNG from magic bytes", () => {
		const buf = Buffer.alloc(12);
		buf[0] = 0x89;
		buf[1] = 0x50; // P
		buf[2] = 0x4e; // N
		buf[3] = 0x47; // G
		expect(sniffImageMime(buf)).toBe("image/png");
	});

	test("detects GIF from magic bytes", () => {
		const buf = Buffer.alloc(12);
		buf[0] = 0x47; // G
		buf[1] = 0x49; // I
		buf[2] = 0x46; // F
		expect(sniffImageMime(buf)).toBe("image/gif");
	});

	test("detects WebP from RIFF+WEBP", () => {
		const buf = Buffer.alloc(12);
		// RIFF at 0-3
		buf.write("RIFF", 0, "latin1");
		// WEBP at 8-11
		buf.write("WEBP", 8, "latin1");
		expect(sniffImageMime(buf)).toBe("image/webp");
	});

	test("detects AVIF from ftyp+avi", () => {
		const buf = Buffer.alloc(12);
		// ftyp at 4-7
		buf.write("ftyp", 4, "latin1");
		// avi at 8-10
		buf.write("avi", 8, "latin1");
		expect(sniffImageMime(buf)).toBe("image/avif");
	});

	test("returns null for unknown bytes", () => {
		const buf = Buffer.alloc(12);
		buf.fill(0x00);
		expect(sniffImageMime(buf)).toBeNull();
	});

	test("returns null for buffers shorter than 12 bytes", () => {
		expect(sniffImageMime(Buffer.alloc(0))).toBeNull();
		expect(sniffImageMime(Buffer.alloc(6))).toBeNull();
		expect(sniffImageMime(Buffer.alloc(11))).toBeNull();
	});

	test("returns null for empty buffer", () => {
		expect(sniffImageMime(Buffer.from(""))).toBeNull();
	});
});

describe("keyFromUrl", () => {
	test("extracts public_id from Cloudinary URL", () => {
		expect(
			keyFromUrl(
				"https://res.cloudinary.com/demo/image/upload/v1234567890/blog/2026/03/my-post-abc123.jpg",
			),
		).toBe("blog/2026/03/my-post-abc123");
	});

	test("handles jpeg extension", () => {
		expect(
			keyFromUrl(
				"https://res.cloudinary.com/demo/image/upload/v1/avatars/user-xyz.jpeg",
			),
		).toBe("avatars/user-xyz");
	});

	test("handles png extension", () => {
		expect(
			keyFromUrl("https://res.cloudinary.com/demo/image/upload/v42/logo.png"),
		).toBe("logo");
	});

	test("handles webp extension", () => {
		expect(
			keyFromUrl("https://res.cloudinary.com/demo/image/upload/v1/photo.webp"),
		).toBe("photo");
	});

	test("returns null for non-Cloudinary URLs", () => {
		expect(keyFromUrl("https://example.com/image.jpg")).toBeNull();
		expect(keyFromUrl("https://storage.google.com/bucket/file.png")).toBeNull();
	});

	test("returns null for URLs without version prefix", () => {
		expect(
			keyFromUrl("https://res.cloudinary.com/demo/image/upload/photo.jpg"),
		).toBeNull();
	});

	test("returns null for unsupported extensions", () => {
		expect(
			keyFromUrl("https://res.cloudinary.com/demo/image/upload/v1/file.bmp"),
		).toBeNull();
	});

	test("returns null for empty string", () => {
		expect(keyFromUrl("")).toBeNull();
	});
});

describe("MAX_UPLOAD_BYTES", () => {
	test("is 10 MB", () => {
		expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
	});
});

describe("StorageNotConfiguredError", () => {
	test("has correct name and message", () => {
		const err = new StorageNotConfiguredError();
		expect(err.name).toBe("StorageNotConfiguredError");
		expect(err.message).toContain("CLOUDINARY");
		expect(err).toBeInstanceOf(Error);
	});
});
