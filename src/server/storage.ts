// src/server/storage.ts
// S3-compatible image uploads (AWS S3, Cloudflare R2, Backblaze B2, MinIO —
// anything speaking the S3 API). Configured entirely through env vars, so
// pointing it at a different provider later needs zero code changes.
//
// SCAFFOLD MODE: credentials are not provisioned yet. Until every
// S3_* variable is present the module degrades gracefully — isStorageReady()
// returns false and uploadImage() throws StorageNotConfiguredError, which
// the upload endpoint converts into a clear 503 for the editor UI.
import {
	DeleteObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";

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
 * type is what decides whether an upload ships to the bucket.
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
 * Best-effort reverse of uploadImage()'s URL scheme: map a public URL back
 * to its bucket key. Returns null for URLs outside S3_PUBLIC_BASE_URL.
 */
export function keyFromUrl(url: string): string | null {
	const base = env("S3_PUBLIC_BASE_URL");
	if (!base) return null;
	const prefix = `${base.replace(/\/+$/, "")}/`;
	return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

/** Delete an object by key (used to clean up replaced avatars etc.). */
export async function deleteImage(key: string): Promise<void> {
	await client().send(
		new DeleteObjectCommand({ Bucket: env("S3_BUCKET"), Key: key }),
	);
}

function env(name: string): string | undefined {
	const value = process.env[name]?.trim();
	return value ? value : undefined;
}

export class StorageNotConfiguredError extends Error {
	constructor() {
		super(
			"Object storage is not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and S3_PUBLIC_BASE_URL (see .env.example).",
		);
		this.name = "StorageNotConfiguredError";
	}
}

let cachedClient: { key: string; client: S3Client } | null = null;

function configKey(): string {
	return [
		env("S3_ENDPOINT") ?? "",
		env("S3_REGION") ?? "",
		env("S3_BUCKET") ?? "",
	].join("|");
}

export function isStorageReady(): boolean {
	return Boolean(
		env("S3_BUCKET") &&
			env("S3_ACCESS_KEY_ID") &&
			env("S3_SECRET_ACCESS_KEY") &&
			env("S3_PUBLIC_BASE_URL"),
	);
}

function client(): S3Client {
	if (!isStorageReady()) throw new StorageNotConfiguredError();
	const key = configKey();
	if (!cachedClient || cachedClient.key !== key) {
		cachedClient = {
			key,
			client: new S3Client({
				// Blank endpoint = AWS proper. Set S3_ENDPOINT for R2/B2/MinIO.
				...(env("S3_ENDPOINT") ? { endpoint: env("S3_ENDPOINT") } : {}),
				region: env("S3_REGION") ?? "auto",
				credentials: {
					accessKeyId: env("S3_ACCESS_KEY_ID") as string,
					secretAccessKey: env("S3_SECRET_ACCESS_KEY") as string,
				},
			}),
		};
	}
	return cachedClient.client;
}

/**
 * Uploads an image buffer and returns its public URL.
 * Key scheme: <folder>/<yyyy>/<mm>/<name>-<rand6>.<ext> — stable, sortable,
 * collision-safe, and cache-friendly once uploaded (immutable content).
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
	const key = `${options.folder ?? "blog"}/${yyyy}/${mm}/${safeName}-${rand}.${ext}`;

	await client().send(
		new PutObjectCommand({
			Bucket: env("S3_BUCKET"),
			Key: key,
			Body: options.buffer,
			ContentType: options.mime,
			CacheControl: "public, max-age=31536000, immutable",
		}),
	);

	const base = (env("S3_PUBLIC_BASE_URL") as string).replace(/\/+$/, "");
	return { url: `${base}/${key}`, key };
}
