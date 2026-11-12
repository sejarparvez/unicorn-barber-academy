import { zodResolver } from '@hookform/resolvers/zod';
import { IconLock } from '@tabler/icons-react';
import { useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { PasswordInput } from '@/components/pages/auth/password-input';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { authClient } from '@/lib/auth-client';
import { type PasswordValues, passwordSchema } from './schemas';

function passwordErrorMessage(message?: string | null) {
	if (!message) {
		return 'Could not update your password. Please try again.';
	}
	if (/invalid password/i.test(message)) {
		return 'Your current password is incorrect.';
	}
	if (/credential account not found/i.test(message)) {
		return 'This account does not have a password.';
	}
	if (/session.*fresh|fresh.*session/i.test(message)) {
		return 'Please sign in again before changing your password.';
	}
	return message;
}

export function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
	if (!hasPassword) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
					<CardDescription>
						Password sign-in is not enabled for this account.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-3 rounded-lg border bg-muted/40 p-4 text-sm">
						<IconLock
							className="mt-0.5 size-4 shrink-0 text-muted-foreground"
							stroke={1.75}
						/>
						<p className="text-muted-foreground">
							You signed in with Google. Manage your password through your
							Google account. You can still update your name and profile photo
							here.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return <PasswordForm />;
}

function PasswordForm() {
	const router = useRouter();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PasswordValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
		mode: 'onTouched',
	});

	async function onSubmit(values: PasswordValues) {
		setServerError(null);

		try {
			const result = await authClient.changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: true,
			});

			if (result.error) {
				setServerError(passwordErrorMessage(result.error.message));
				return;
			}

			reset();
			await router.invalidate();
			toast.success('Password updated. Other sessions have been signed out.');
		} catch (_error) {
			setServerError(
				'Network error while updating your password. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields and try again.');
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>
					Change your password. Other devices will be signed out.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit, onInvalid)}
					className="flex flex-col gap-6"
				>
					<FieldGroup className="gap-5">
						<Field data-invalid={!!errors.currentPassword}>
							<FieldLabel htmlFor="current-password">
								Current password
							</FieldLabel>
							<PasswordInput
								id="current-password"
								autoComplete="current-password"
								aria-invalid={!!errors.currentPassword}
								aria-describedby={
									errors.currentPassword ? 'current-password-error' : undefined
								}
								{...register('currentPassword')}
							/>
							<FieldError
								id="current-password-error"
								errors={[errors.currentPassword]}
							/>
						</Field>

						<Field data-invalid={!!errors.newPassword}>
							<FieldLabel htmlFor="new-password">New password</FieldLabel>
							<PasswordInput
								id="new-password"
								autoComplete="new-password"
								aria-invalid={!!errors.newPassword}
								aria-describedby={
									errors.newPassword ? 'new-password-error' : undefined
								}
								{...register('newPassword')}
							/>
							<FieldDescription>
								Use 8 or more characters with a mix of letters and numbers.
							</FieldDescription>
							<FieldError
								id="new-password-error"
								errors={[errors.newPassword]}
							/>
						</Field>

						<Field data-invalid={!!errors.confirmPassword}>
							<FieldLabel htmlFor="confirm-password">
								Confirm new password
							</FieldLabel>
							<PasswordInput
								id="confirm-password"
								autoComplete="new-password"
								aria-invalid={!!errors.confirmPassword}
								aria-describedby={
									errors.confirmPassword ? 'confirm-password-error' : undefined
								}
								{...register('confirmPassword')}
							/>
							<FieldError
								id="confirm-password-error"
								errors={[errors.confirmPassword]}
							/>
						</Field>
					</FieldGroup>

					{serverError ? <AuthAlert message={serverError} /> : null}

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Updating…' : 'Update password'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
