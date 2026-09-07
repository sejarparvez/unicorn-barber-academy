// routes/api/upload/avatar.tsx
// POST — avatar upload for the signed-in user (any role). Same-origin +
// session required; 2 MB cap and a tighter MIME whitelist than blog uploads
// since avatars render small. On success the better-auth user record is
// updated server-side, so every session picks up the new image.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { guardAuthenticatedEndpoint } from "@/server/api-guard";
import { auth } from "@/server/auth";
import {
	deleteImage,
	keyFromUrl,
	StorageNotConfiguredError,
	sniffImageMime,
	uploadImage,
} from "@/server/storage";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/upload/avatar")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await guardAuthenticatedEndpoint(request, {
					rateKey: "avatar",
					rateMax: 10,
					rateWindowMs: 60_000,
				});
				if (!guard.ok) return guard.response;

				let form: FormData;
				try {
					form = await request.formData();
				} catch {
					return json({ message: "Invalid form data" }, { status: 400 });
				}
				const file = form.get("file");
				if (!(file instanceof File)) {
					return json({ message: "No file provided" }, { status: 400 });
				}
				if (file.size > MAX_AVATAR_BYTES) {
					return json(
						{ message: "Avatar must be 2 MB or smaller" },
						{ status: 413 },
					);
				}

				try {
					const buffer = Buffer.from(await file.arrayBuffer());
					// The declared Content-Type is client-controlled — the real
					// type is sniffed from magic bytes and must be an allowed image.
					const mime = sniffImageMime(buffer);
					if (!mime || !AVATAR_MIME.has(mime)) {
						return json(
							{ message: "Avatar must be a JPEG, PNG, or WebP image" },
							{ status: 415 },
						);
					}
					const previousImage = guard.userImage;
					const { url } = await uploadImage({
						buffer,
						mime,
						namePrefix: `avatar-${guard.userId}`,
						folder: "avatars",
					});
					await auth.api.updateUser({
						headers: request.headers,
						body: { image: url },
					});
					// Clean up the replaced object so avatars don't accumulate.
					if (previousImage) {
						const oldKey = keyFromUrl(previousImage);
						if (oldKey?.startsWith("avatars/")) {
							await deleteImage(oldKey).catch((error) => {
								console.error("[avatar-upload] cleanup failed:", error);
							});
						}
					}
					return json({ ok: true, url });
				} catch (error) {
					if (error instanceof StorageNotConfiguredError) {
						return json({ message: error.message }, { status: 503 });
					}
					console.error("[avatar-upload]", error);
					return json(
						{ message: "Upload failed. Please try again." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
