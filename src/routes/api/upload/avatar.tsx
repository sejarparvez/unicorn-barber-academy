// routes/api/upload/avatar.tsx
// POST — avatar upload for the signed-in user (any role). Same-origin +
// session required; 2 MB cap and a tighter MIME whitelist than blog uploads
// since avatars render small. On success the better-auth user record is
// updated server-side, so every session picks up the new image.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseRole } from "@/lib/roles";
import { auth } from "@/server/auth";
import { isSameOrigin } from "@/server/rate-limit";
import { StorageNotConfiguredError, uploadImage } from "@/server/storage";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const AVATAR_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export const Route = createFileRoute("/api/upload/avatar")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				if (!isSameOrigin(request)) {
					return json({ message: "Forbidden" }, { status: 403 });
				}
				const session = await auth.api.getSession({ headers: request.headers });
				if (!session || !parseRole(session.user.role as string)) {
					return json({ message: "Sign in required" }, { status: 401 });
				}

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
				if (!AVATAR_MIME.has(file.type)) {
					return json(
						{ message: "Avatar must be a JPEG, PNG, or WebP image" },
						{ status: 400 },
					);
				}
				if (file.size > MAX_AVATAR_BYTES) {
					return json(
						{ message: "Avatar must be 2 MB or smaller" },
						{ status: 413 },
					);
				}

				try {
					const buffer = Buffer.from(await file.arrayBuffer());
					const { url } = await uploadImage({
						buffer,
						mime: file.type,
						namePrefix: `avatar-${session.user.id}`,
						folder: "avatars",
					});
					await auth.api.updateUser({
						headers: request.headers,
						body: { image: url },
					});
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
