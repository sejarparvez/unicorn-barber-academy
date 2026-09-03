// src/server/storage.ts
// Blog/avatar image uploads via Cloudinary (free tier, no credit card).
// Configured entirely through env vars: CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. If any are missing the module
// degrades gracefully — isStorageReady() returns false and uploadImage()
// throws StorageNotConfiguredError.
import { createHash } from "node:crypto";

/** Whitelist — images only; anything else is rejected before upload. */
const ALLOWED_MIME = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/avif",
	"image/gif",
]);

const EXT_BY_MIME: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
	"image/avif": "avif",
	"image/gif": "gif",
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function isAllowedImageMime(mime: string): boolean {
	return ALLOWED_MIME.has(mime);
}

/**
 * Detect the real image type from magic bytes. `file.type` from a multipart
 * form is entirely client-declared — never trusted on its own; the sniffed
 * type is what decides whether an upload ships to Cloudinary.
 */
export function sniffImageMime(buffer: Buffer): string | null {
	if (buffer.length < 12) return null;
	const ascii = (start: number, end: number) =>
		buffer.subarray(start, end).toString("latin1");
	if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
		return "image/jpeg";
	if (
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47
	)
		return "image/png";
	if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46)
		return "image/gif";
	if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
	if (ascii(4, 8) === "ftyp" && ascii(8, 11) === "avi") return "image/avif";
	return null;
}

/**
 * Reverse of uploadImage()'s URL scheme: map a public delivery URL back to
 * its Cloudinary public_id. Returns null for URLs outside the cloud.
 */
export function keyFromUrl(url: string): string | null {
	// Extract public_id from the /v<ver>/<public_id>.<ext> delivery URL.
	const match = url.match(/\/v\d+\/(.+)\.(?:jpg|jpeg|png|webp|gif|avif)$/i);
	return match ? match[1] : null;
}

/** Delete an upload by public_id (used to clean up replaced avatars etc.). */
export async function deleteImage(publicId: string): Promise<void> {
	await destroyCloudinary(publicId);
}

function env(name: string): string | undefined {
	const value = process.env[name]?.trim();
	return value ? value : undefined;
}

export class StorageNotConfiguredError extends Error {
	constructor() {
		super(
			"Object storage is not configured: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.",
		);
		this.name = "StorageNotConfiguredError";
	}
}

export function isStorageReady(): boolean {
	return Boolean(
		env("CLOUDINARY_CLOUD_NAME") &&
			env("CLOUDINARY_API_KEY") &&
			env("CLOUDINARY_API_SECRET"),
	);
}

function cloudinaryBase(): string {
	const name = env("CLOUDINARY_CLOUD_NAME");
	if (!name) throw new StorageNotConfiguredError();
	return `https://api.cloudinary.com/v1_1/${name}/image`;
}

/** Sign Cloudinary params: sorted name=value pairs + api_secret, then SHA-1. */
function cloudinarySignature(params: Record<string, string | number>): string {
	const secret = env("CLOUDINARY_API_SECRET");
	if (!secret) throw new StorageNotConfiguredError();
	const str = Object.keys(params)
		.sort()
		.map((k) => `${k}=${params[k]}`)
		.join("&");
	return createHash("sha1").update(`${str}${secret}`).digest("hex");
}

/**
 * Uploads an image buffer and returns its public URL and public_id.
 * Organized into Cloudinary folders by the `folder` option ("avatars",
 * "blog", ...). public_id: <folder>/<yyyy>/<mm>/<name>-<rand6> — stable,
 * sortable, and collision-safe; Cloudinary appends the extension on delivery.
 */
export async function uploadImage(options: {
	buffer: Buffer;
	mime: string;
	namePrefix: string;
	folder?: string;
}): Promise<{ url: string; key: string }> {
	const ext = EXT_BY_MIME[options.mime];
	if (!ext) throw new Error(`Unsupported image type: ${options.mime}`);

	const now = new Date();
	const yyyy = now.getUTCFullYear();
	const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
	const rand = Math.random().toString(36).slice(2, 8);
	const safeName =
		options.namePrefix
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
			.slice(0, 60) || "img";
	// folder passed to Cloudinary builds a real folder hierarchy; public_id is
	// the full folded path so keyFromUrl() can reverse it back.
	const folder = options.folder ?? "blog";
	const yyyymm = `${yyyy}/${mm}`;
	const publicId = `${folder}/${yyyymm}/${safeName}-${rand}`;

	const apiKey = env("CLOUDINARY_API_KEY");
	if (!apiKey) throw new StorageNotConfiguredError();
	const timestamp = Math.floor(Date.now() / 1000);

	const form = new FormData();
	form.append("file", new Blob([options.buffer]), `${publicId}.${ext}`);
	form.append("folder", folder);
	form.append("public_id", `${yyyymm}/${safeName}-${rand}`);
	form.append("api_key", apiKey);
	form.append("timestamp", String(timestamp));
	form.append(
		"signature",
		cloudinarySignature({
			folder,
			public_id: `${yyyymm}/${safeName}-${rand}`,
			timestamp,
		}),
	);

	const res = await fetch(`${cloudinaryBase()}/upload`, {
		method: "POST",
		body: form,
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Cloudinary upload failed (${res.status}): ${body}`);
	}

	const json = (await res.json()) as { secure_url?: string };
	const url = json.secure_url;
	if (!url) throw new Error("Cloudinary response missing secure_url");

	return { url, key: publicId };
}

async function destroyCloudinary(publicId: string): Promise<void> {
	const apiKey = env("CLOUDINARY_API_KEY");
	if (!apiKey) throw new StorageNotConfiguredError();
	const timestamp = Math.floor(Date.now() / 1000);
	const params = { public_id: publicId, timestamp };

	const form = new FormData();
	form.append("public_id", publicId);
	form.append("api_key", apiKey);
	form.append("timestamp", String(timestamp));
	form.append("signature", cloudinarySignature(params));

	const res = await fetch(`${cloudinaryBase()}/destroy`, {
		method: "POST",
		body: form,
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Cloudinary destroy failed (${res.status}): ${body}`);
	}
}
