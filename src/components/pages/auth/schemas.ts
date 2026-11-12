import { z } from 'zod';

const email = z
	.string()
	.trim()
	.min(1, 'Please enter your email address.')
	.email('Please enter a valid email address.');

const newPassword = z
	.string()
	.min(8, 'Password must be at least 8 characters.')
	.max(128, 'Password must be 128 characters or fewer.');

export const signInSchema = z.object({
	email,
	password: z.string().min(1, 'Please enter your password.'),
});

export const signUpSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'Please enter your full name.')
			.max(80, 'Name must be 80 characters or fewer.'),
		email,
		password: newPassword,
		confirmPassword: z.string().min(1, 'Please confirm your password.'),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.',
	});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
	.object({
		password: newPassword,
		confirmPassword: z.string().min(1, 'Please confirm your password.'),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.',
	});

export const verifyEmailSchema = z.object({ email });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
