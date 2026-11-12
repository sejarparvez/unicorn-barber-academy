import { z } from 'zod';
import { isAcceptedAvatarType, MAX_AVATAR_BYTES } from './avatar-upload';

const name = z
	.string()
	.trim()
	.min(2, 'Please enter your full name.')
	.max(80, 'Name must be 80 characters or fewer.');

const newPassword = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(128, 'Password must be 128 characters or fewer.');

export const profileSchema = z.object({
	name,
	avatar: z
		.custom<File | null>(
			(value) =>
				value === null ||
				(typeof File !== 'undefined' && value instanceof File),
			{ message: 'Choose a valid image file.' },
		)
		.refine(
			(file) => !file || file.size <= MAX_AVATAR_BYTES,
			'Your profile photo must be 1 MB or smaller.',
		)
		.refine(
			(file) => !file || isAcceptedAvatarType(file.type),
			'Choose a JPEG, PNG, or WebP image.',
		),
});

export const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Please enter your current password.'),
		newPassword,
		confirmPassword: z.string().min(1, 'Please confirm your new password.'),
	})
	.refine((values) => values.newPassword === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.',
	})
	.refine((values) => values.newPassword !== values.currentPassword, {
		path: ['newPassword'],
		message: 'Choose a password different from your current one.',
	});

export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
