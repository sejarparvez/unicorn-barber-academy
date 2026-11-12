import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { AuthCard } from '@/components/pages/auth/auth-card';
import {
	type ForgotPasswordValues,
	forgotPasswordSchema,
} from '@/components/pages/auth/schemas';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_public/auth/forgot-password')({
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: 'Reset Password | Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Request a password reset link for your Unicorn Barber Training Academy account.',
			},
			{ name: 'robots', content: 'noindex' },
		],
	}),
});

function RouteComponent() {
	const [sent, setSent] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: '' },
		mode: 'onTouched',
	});

	async function onSubmit(values: ForgotPasswordValues) {
		setServerError(null);

		try {
			const res = await authClient.requestPasswordReset({
				email: values.email,
				redirectTo: '/auth/reset-password',
			});
			if (res.error) {
				setServerError(res.error.message ?? 'Unable to send reset link.');
				return;
			}
			setSent(true);
			toast.success('Reset link sent. Check your inbox.');
		} catch (_err) {
			setServerError(
				'Network error while sending the reset link. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please enter a valid email address.');
	}

	return (
		<AuthCard
			title="Forgot your password?"
			subtitle="Enter your account email and we'll send you a link to set a new password."
		>
			<div className="mt-6">
				{sent ? (
					<div className="space-y-5">
						<AuthAlert
							tone="success"
							message="If that email belongs to an academy account, a reset link is on its way. It expires in one hour."
						/>
						<p className="text-center text-sm text-muted-foreground">
							Didn't get it? Check your spam folder or{' '}
							<button
								type="button"
								onClick={() => {
									reset({ email: '' });
									setSent(false);
								}}
								className="font-medium text-primary underline-offset-4 hover:underline"
							>
								try again
							</button>
							.
						</p>
					</div>
				) : (
					<form
						noValidate
						onSubmit={handleSubmit(onSubmit, onInvalid)}
						className="flex flex-col gap-5"
					>
						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								aria-invalid={!!errors.email}
								aria-describedby={
									errors.email ? 'forgot-email-error' : undefined
								}
								{...register('email')}
							/>
							<FieldError id="forgot-email-error" errors={[errors.email]} />
						</Field>

						{serverError ? <AuthAlert message={serverError} /> : null}

						<Button
							type="submit"
							size="lg"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Sending…' : 'Send Reset Link'}
						</Button>
					</form>
				)}

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Remembered it after all?{' '}
					<Link
						to="/auth/signin"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
