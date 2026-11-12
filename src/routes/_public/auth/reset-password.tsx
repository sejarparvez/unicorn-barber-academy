import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { AuthCard } from '@/components/pages/auth/auth-card';
import { PasswordInput } from '@/components/pages/auth/password-input';
import {
	type ResetPasswordValues,
	resetPasswordSchema,
} from '@/components/pages/auth/schemas';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';

type ResetSearch = {
	token?: string;
};

export const Route = createFileRoute('/_public/auth/reset-password')({
	validateSearch: (search: Record<string, unknown>): ResetSearch => ({
		token:
			typeof search.token === 'string' && search.token.length > 0
				? search.token
				: undefined,
	}),
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: 'Set a New Password | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: '', confirmPassword: '' },
		mode: 'onTouched',
	});

	async function onSubmit(values: ResetPasswordValues) {
		setServerError(null);

		if (!search.token) {
			setServerError(
				'This reset link is missing its token. Request a fresh link and try again.',
			);
			return;
		}

		try {
			const res = await authClient.resetPassword({
				newPassword: values.password,
				token: search.token,
			});
			if (res.error) {
				setServerError(
					res.error.message ??
						'This reset link is invalid or has expired. Please request a new one.',
				);
				return;
			}
			toast.success('Password updated. Sign in with your new password.');
			router.navigate({ to: '/auth/signin', search: { reset: '1' } });
		} catch (_err) {
			setServerError(
				'Network error while resetting your password. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields and try again.');
	}

	return (
		<AuthCard
			title="Set a new password"
			subtitle="Choose a strong password you haven't used elsewhere."
		>
			<div className="mt-6">
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit, onInvalid)}
					className="flex flex-col gap-5"
				>
					<FieldGroup className="gap-5">
						<Field data-invalid={!!errors.password}>
							<FieldLabel htmlFor="password">New Password</FieldLabel>
							<PasswordInput
								id="password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								aria-invalid={!!errors.password}
								aria-describedby={
									errors.password ? 'reset-password-error' : undefined
								}
								{...register('password')}
							/>
							<FieldDescription>
								Use 8 or more characters with a mix of letters and numbers.
							</FieldDescription>
							<FieldError
								id="reset-password-error"
								errors={[errors.password]}
							/>
						</Field>

						<Field data-invalid={!!errors.confirmPassword}>
							<FieldLabel htmlFor="confirmPassword">
								Confirm New Password
							</FieldLabel>
							<PasswordInput
								id="confirmPassword"
								autoComplete="new-password"
								placeholder="Repeat your new password"
								aria-invalid={!!errors.confirmPassword}
								aria-describedby={
									errors.confirmPassword
										? 'reset-confirm-password-error'
										: undefined
								}
								{...register('confirmPassword')}
							/>
							<FieldError
								id="reset-confirm-password-error"
								errors={[errors.confirmPassword]}
							/>
						</Field>
					</FieldGroup>

					{!search.token ? (
						<AuthAlert message="No reset token found in this link. Request a fresh password reset email." />
					) : null}
					{serverError ? <AuthAlert message={serverError} /> : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isSubmitting || !search.token}
					>
						{isSubmitting ? 'Updating…' : 'Update Password'}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					<Link
						to="/auth/forgot-password"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Request a new reset link
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
