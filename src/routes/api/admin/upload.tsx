// routes/api/admin/upload.tsx
// Image upload for the blog editor (covers + in-article images).
// Admin-session guarded; streams multipart/form-data to S3-compatible object
// storage. Until S3_* env vars are configured this returns a descriptive 503
// instead of failing mysteriously (scaffold mode — see src/server/storage.ts).
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import {
	isAllowedImageMime,
	MAX_UPLOAD_BYTES,
	StorageNotConfiguredError,
	sniffImageMime,
	uploadImage,
} from "@/server/storage";

export const Route = createFileRoute("/api/admin/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}

				let form: FormData;
				try {
					form = await request.formData();
				} catch {
					return json(
						{ message: "Expected multipart/form-data with a 'file' field" },
						{ status: 400 },
					);
				}

				const file = form.get("file");
				if (!(file instanceof File)) {
					return json({ message: "Missing 'file' field" }, { status: 400 });
				}
				if (file.size > MAX_UPLOAD_BYTES) {
					return json(
						{
							message: `Image exceeds the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit`,
						},
						{ status: 413 },
					);
				}

				const namePrefix =
					typeof form.get("name") === "string"
						? (form.get("name") as string)
						: "post";

				try {
					const buffer = Buffer.from(await file.arrayBuffer());
					// Trust nothing from the client: the real type comes from
					// magic-byte sniffing, not the declared Content-Type.
					const mime = sniffImageMime(buffer);
					if (!mime || !isAllowedImageMime(mime)) {
						return json(
							{
								message:
									"Only JPEG, PNG, WebP, AVIF, or GIF images are allowed",
							},
							{ status: 415 },
						);
					}
					const { url, key } = await uploadImage({
						buffer,
						mime,
						namePrefix,
					});
					return json({ url, key });
				} catch (error) {
					if (error instanceof StorageNotConfiguredError) {
						console.error("[upload]", error.message);
						return json(
							{
								message:
									"Uploads are not configured yet — set the S3_* variables in .env.",
							},
							{ status: 503 },
						);
					}
					console.error("[upload] failed:", error);
					return json({ message: "Upload failed" }, { status: 500 });
				}
			},
		},
	},
});
