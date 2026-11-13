import { createHash, randomUUID } from 'node:crypto';
import { createServerFn } from '@tanstack/react-start';
import { ensureAdmin, ensureSession } from '@/lib/auth.functions';

export type AvatarUploadSignature = {
	cloudName: string;
	apiKey: string;
	timestamp: number;
	publicId: string;
	signature: string;
	uploadUrl: string;
};

/** Resolves Cloudinary credentials or explains how to configure them. */
function getCloudinaryConfig() {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
	const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
	const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error(
			'Image upload is not configured. Add the Cloudinary environment variables and try again.',
		);
	}

	return { cloudName, apiKey, apiSecret };
}

function signUpload(apiSecret: string, params: Record<string, string>): string {
	const toSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');

	return createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
}

export const getAvatarUploadSignature = createServerFn({
	method: 'POST',
}).handler(async (): Promise<AvatarUploadSignature> => {
	const session = await ensureSession();
	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

	const timestamp = Math.floor(Date.now() / 1000);
	const publicId = `avatars/${session.user.id}`;

	const signature = signUpload(apiSecret, {
		invalidate: 'true',
		overwrite: 'true',
		public_id: publicId,
		timestamp: String(timestamp),
	});

	return {
		cloudName,
		apiKey,
		timestamp,
		publicId,
		signature,
		uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
	};
});

/**
 * Signature for a blog image. Admins only — the cover and inline images are
 * content, so no student uploads are allowed here. Each upload gets a fresh
 * public id under `blog/` so an edit never overwrites a referenced asset.
 */
export const getPostImageUploadSignature = createServerFn({
	method: 'POST',
}).handler(async (): Promise<AvatarUploadSignature> => {
	await ensureAdmin();
	const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

	const timestamp = Math.floor(Date.now() / 1000);
	const publicId = `blog/${randomUUID()}`;

	const signature = signUpload(apiSecret, {
		public_id: publicId,
		timestamp: String(timestamp),
	});

	return {
		cloudName,
		apiKey,
		timestamp,
		publicId,
		signature,
		uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
	};
});
