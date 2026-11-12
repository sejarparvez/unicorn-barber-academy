import { zodResolver } from '@hookform/resolvers/zod';
import {
	createFileRoute,
	Link,
	redirect,
	useRouter,
} from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { AuthCard } from '@/components/pages/auth/auth-card';
import { AuthDivider } from '@/components/pages/auth/auth-divider';
import { GoogleIcon } from '@/components/pages/auth/google-icon';
import { PasswordInput } from '@/components/pages/auth/password-input';
import {
	type SignInValues,
	signInSchema,
} from '@/components/pages/auth/schemas';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { safeRedirect } from '@/lib/utils';

type SignInSearch = {
	redirect?: string;
	reset?: string;
};

export const Route = createFileRoute('/_public/auth/signin')({
	// safeRedirect here means the typed search param can never carry an
	// off-site target (protocol-relative "//host", backslash tricks, etc.).
	validateSearch: (search: Record<string, unknown>): SignInSearch => ({
		redirect:
			typeof search.redirect === 'string'
				? safeRedirect(search.redirect, '/dashboard')
				: undefined,
		reset: search.reset === '1' ? '1' : undefined,
	}),
	// Already signed in? There is nothing to do on this page.
	beforeLoad: ({ context }) => {
		if (context.session) throw redirect({ to: '/dashboard' });
	},
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: 'Sign In | Unicorn Barber Training Academy' },
			{
				name: 'description',
				content: 'Sign in to your Unicorn Barber Training Academy account.',
			},
			{ name: 'robots', content: 'noindex' },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [googlePending, setGooglePending] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: '', password: '' },
		mode: 'onTouched',
	});

	async function onSubmit(values: SignInValues) {
		setServerError(null);
		setUnverifiedEmail(null);

		try {
			const res = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});
			if (res.error) {
				if (
					res.error.code === 'EMAIL_NOT_VERIFIED' ||
					/not verified/i.test(res.error.message ?? '')
				) {
					setUnverifiedEmail(values.email);
					return;
				}
				setServerError(
					res.error.message ?? 'Unable to sign in. Please try again.',
				);
				return;
			}
			toast.success('Signed in. Welcome back.');
			router.invalidate();
			router.history.push(search.redirect ?? '/dashboard');
		} catch (_err) {
			setServerError(
				'Network error while signing in. Check your connection and try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields and try again.');
	}

	async function handleGoogle() {
		setServerError(null);
		setGooglePending(true);
		try {
			const res = await authClient.signIn.social({
				provider: 'google',
				callbackURL: search.redirect ?? '/dashboard',
			});
			if (res.error) {
				setServerError(friendlyAuthError(res.error.message));
				setGooglePending(false);
			}
			// On success better-auth redirects the whole browser to Google —
			// nothing to do here.
		} catch (_err) {
			setServerError(
				'Network error while starting Google sign-in. Please try again.',
			);
			setGooglePending(false);
		}
	}

	return (
		<AuthCard
			title="Welcome back"
			subtitle="Sign in to continue your training at Unicorn Barber Training Academy."
		>
			<div className="mt-6">
				{unverifiedEmail ? (
					<div className="mb-5 space-y-3">
						<AuthAlert message="Please verify your email before signing in — we sent a link when you created your account." />
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="w-full"
							disabled={isSubmitting}
							onClick={() =>
								router.navigate({
									to: '/auth/verify-email',
									search: {
										email: unverifiedEmail,
										redirect: search.redirect,
									},
								})
							}
						>
							Resend verification email
						</Button>
					</div>
				) : null}

				{search.reset === '1' && !serverError && !unverifiedEmail ? (
					<div className="mb-5">
						<AuthAlert
							tone="success"
							message="Password updated. Sign in with your new password to continue."
						/>
					</div>
				) : null}

				<Button
					type="button"
					variant="outline"
					size="lg"
					className="w-full gap-2.5 font-medium"
					onClick={handleGoogle}
					disabled={googlePending || isSubmitting}
				>
					<GoogleIcon className="h-4 w-4 shrink-0" />
					{googlePending ? 'Redirecting…' : 'Continue with Google'}
				</Button>

				<AuthDivider />

				<form
					noValidate
					onSubmit={handleSubmit(onSubmit, onInvalid)}
					className="flex flex-col gap-5"
				>
					<FieldGroup className="gap-5">
						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								aria-invalid={!!errors.email}
								aria-describedby={
									errors.email ? 'signin-email-error' : undefined
								}
								{...register('email')}
							/>
							<FieldError id="signin-email-error" errors={[errors.email]} />
						</Field>

						<Field data-invalid={!!errors.password}>
							<div className="flex items-center justify-between gap-3">
								<FieldLabel htmlFor="password">Password</FieldLabel>
								<Link
									to="/auth/forgot-password"
									className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<PasswordInput
								id="password"
								autoComplete="current-password"
								placeholder="••••••••"
								aria-invalid={!!errors.password}
								aria-describedby={
									errors.password ? 'signin-password-error' : undefined
								}
								{...register('password')}
							/>
							<FieldError
								id="signin-password-error"
								errors={[errors.password]}
							/>
						</Field>
					</FieldGroup>

					{serverError ? <AuthAlert message={serverError} /> : null}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Signing in…' : 'Sign In'}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					New to the academy?{' '}
					<Link
						to="/auth/signup"
						search={{ redirect: search.redirect }}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Create an account
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
