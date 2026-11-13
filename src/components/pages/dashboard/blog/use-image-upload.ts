// Shared upload state for the blog editor's cover and inline image controls.
// The browser uploads straight to Cloudinary with a signature minted by the
// admin-only server function, so the API secret never reaches the client.
import { useState } from 'react';
import { getPostImageUploadSignature } from '@/server/cloudinary';

export const MAX_POST_IMAGE_BYTES = 5 * 1024 * 1024;

export const POST_IMAGE_MIME_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/avif',
] as const;

export function isAcceptedPostImage(type: string) {
	return POST_IMAGE_MIME_TYPES.some((accepted) => accepted === type);
}

async function uploadToCloudinary(file: File): Promise<string> {
	const signature = await getPostImageUploadSignature();

	const formData = new FormData();
	formData.append('file', file);
	formData.append('api_key', signature.apiKey);
	formData.append('timestamp', String(signature.timestamp));
	formData.append('public_id', signature.publicId);
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
				'Could not upload the image. Please try again.',
		);
	}

	return payload.secure_url;
}

export function useImageUpload() {
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function upload(file: File): Promise<string | null> {
		if (uploading) {
			return null;
		}

		if (!isAcceptedPostImage(file.type)) {
			setError('Use a JPEG, PNG, WebP or AVIF image.');
			return null;
		}

		if (file.size > MAX_POST_IMAGE_BYTES) {
			setError('Images must be 5 MB or smaller.');
			return null;
		}

		setUploading(true);
		setError(null);

		try {
			return await uploadToCloudinary(file);
		} catch (uploadError) {
			setError(
				uploadError instanceof Error
					? uploadError.message
					: 'Image upload failed.',
			);
			return null;
		} finally {
			setUploading(false);
		}
	}

	return { upload, uploading, error, clearError: () => setError(null) };
}
