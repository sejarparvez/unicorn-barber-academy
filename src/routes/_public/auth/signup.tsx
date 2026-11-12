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
	type SignUpValues,
	signUpSchema,
} from '@/components/pages/auth/schemas';
import { Button } from '@/components/ui/button';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { friendlyAuthError } from '@/lib/auth-errors';
import { safeRedirect } from '@/lib/utils';

type SignUpSearch = {
	redirect?: string;
};

export const Route = createFileRoute('/_public/auth/signup')({
	validateSearch: (search: Record<string, unknown>): SignUpSearch => ({
		redirect:
			typeof search.redirect === 'string'
				? safeRedirect(search.redirect, '/dashboard')
				: undefined,
	}),
	// Already signed in? There is nothing to do on this page.
	beforeLoad: ({ context }) => {
		if (context.session) throw redirect({ to: '/dashboard' });
	},
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: 'Create Account | Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Create your Unicorn Barber Training Academy account to enroll and manage your training.',
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

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onTouched',
	});

	async function onSubmit(values: SignUpValues) {
		setServerError(null);

		try {
			const successSearch = new URLSearchParams({ state: 'success' });
			if (search.redirect) {
				successSearch.set('redirect', search.redirect);
			}

			const res = await authClient.signUp.email({
				name: values.name,
				email: values.email,
				password: values.password,
				callbackURL: `/auth/verify-email?${successSearch.toString()}`,
			});
			if (res.error) {
				setServerError(
					res.error.message ?? 'Unable to create account. Please try again.',
				);
				return;
			}

			toast.success('Account created. Check your inbox to verify your email.');
			router.navigate({
				to: '/auth/verify-email',
				search: {
					email: values.email,
					redirect: search.redirect,
				},
			});
		} catch (_err) {
			setServerError(
				'Network error while creating your account. Check your connection and try again.',
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
		} catch (_err) {
			setServerError(
				'Network error while starting Google sign-up. Please try again.',
			);
			setGooglePending(false);
		}
	}

	return (
		<AuthCard
			title="Create your account"
			subtitle="Enroll in programs and manage your training journey."
		>
			<div className="mt-6">
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
						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Full Name</FieldLabel>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								placeholder="Your name"
								aria-invalid={!!errors.name}
								aria-describedby={errors.name ? 'signup-name-error' : undefined}
								{...register('name')}
							/>
							<FieldError id="signup-name-error" errors={[errors.name]} />
						</Field>

						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								aria-invalid={!!errors.email}
								aria-describedby={
									errors.email ? 'signup-email-error' : undefined
								}
								{...register('email')}
							/>
							<FieldError id="signup-email-error" errors={[errors.email]} />
						</Field>

						<Field data-invalid={!!errors.password}>
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<PasswordInput
								id="password"
								autoComplete="new-password"
								placeholder="At least 8 characters"
								aria-invalid={!!errors.password}
								aria-describedby={
									errors.password ? 'signup-password-error' : undefined
								}
								{...register('password')}
							/>
							<FieldDescription>
								Use 8 or more characters with a mix of letters and numbers.
							</FieldDescription>
							<FieldError
								id="signup-password-error"
								errors={[errors.password]}
							/>
						</Field>

						<Field data-invalid={!!errors.confirmPassword}>
							<FieldLabel htmlFor="confirmPassword">
								Confirm Password
							</FieldLabel>
							<PasswordInput
								id="confirmPassword"
								autoComplete="new-password"
								placeholder="Repeat your password"
								aria-invalid={!!errors.confirmPassword}
								aria-describedby={
									errors.confirmPassword
										? 'signup-confirm-password-error'
										: undefined
								}
								{...register('confirmPassword')}
							/>
							<FieldError
								id="signup-confirm-password-error"
								errors={[errors.confirmPassword]}
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
						{isSubmitting ? 'Creating account…' : 'Create Account'}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Already have an account?{' '}
					<Link
						to="/auth/signin"
						search={{ redirect: search.redirect }}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</AuthCard>
	);
}
