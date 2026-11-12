import { createHash } from 'node:crypto';
import { createServerFn } from '@tanstack/react-start';
import { ensureSession } from '@/lib/auth.functions';

export type AvatarUploadSignature = {
	cloudName: string;
	apiKey: string;
	timestamp: number;
	publicId: string;
	signature: string;
	uploadUrl: string;
};

export const getAvatarUploadSignature = createServerFn({
	method: 'POST',
}).handler(async (): Promise<AvatarUploadSignature> => {
	const session = await ensureSession();

	const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
	const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
	const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error(
			'Image upload is not configured. Add the Cloudinary environment variables and try again.',
		);
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const publicId = `avatars/${session.user.id}`;

	const params = {
		invalidate: 'true',
		overwrite: 'true',
		public_id: publicId,
		timestamp: String(timestamp),
	};

	const toSign = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key as keyof typeof params]}`)
		.join('&');

	const signature = createHash('sha1')
		.update(`${toSign}${apiSecret}`)
		.digest('hex');

	return {
		cloudName,
		apiKey,
		timestamp,
		publicId,
		signature,
		uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
	};
});
