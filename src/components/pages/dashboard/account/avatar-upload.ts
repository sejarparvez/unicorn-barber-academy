import type { AvatarUploadSignature } from '@/server/cloudinary';

/** Cloudinary's max for this flow. Kept client-safe so zod can reuse it. */
export const MAX_AVATAR_BYTES = 1024 * 1024;

export const AVATAR_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
] as const;

export function isAcceptedAvatarType(type: string) {
	return AVATAR_MIME_TYPES.some((accepted) => accepted === type);
}

export async function uploadAvatar(
	file: File,
	signature: AvatarUploadSignature,
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('api_key', signature.apiKey);
	formData.append('timestamp', String(signature.timestamp));
	formData.append('public_id', signature.publicId);
	formData.append('invalidate', 'true');
	formData.append('overwrite', 'true');
	formData.append('signature', signature.signature);

	const response = await fetch(signature.uploadUrl, {
		method: 'POST',
		body: formData,
	});

	const payload = (await response.json().catch(() => null)) as {
		secure_url?: string;
		error?: { message?: string };
	} | null;

	if (!response.ok || !payload?.secure_url) {
		throw new Error(
			payload?.error?.message ??
				'Could not upload your photo. Please try again.',
		);
	}

	return payload.secure_url;
}
