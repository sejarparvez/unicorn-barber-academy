import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import { AuthCard } from '@/components/pages/auth/auth-card';
import {
	type VerifyEmailValues,
	verifyEmailSchema,
} from '@/components/pages/auth/schemas';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { safeRedirect } from '@/lib/utils';

type VerifySearch = {
	email?: string;
	state?: string;
	redirect?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_COOLDOWN_SECONDS = 60;

export const Route = createFileRoute('/_public/auth/verify-email')({
	validateSearch: (search: Record<string, unknown>): VerifySearch => ({
		email:
			typeof search.email === 'string' && EMAIL_RE.test(search.email)
				? search.email
				: undefined,
		state: search.state === 'success' ? 'success' : undefined,
		redirect:
			typeof search.redirect === 'string'
				? safeRedirect(search.redirect, '/dashboard')
				: undefined,
	}),
	component: RouteComponent,
	head: () => ({
		meta: [
			{ title: 'Verify Your Email | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex' },
		],
	}),
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [sent, setSent] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [cooldown, setCooldown] = useState(0);

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<VerifyEmailValues>({
		resolver: zodResolver(verifyEmailSchema),
		defaultValues: { email: search.email ?? '' },
		mode: 'onTouched',
	});

	const emailValue = watch('email');

	useEffect(() => {
		if (cooldown <= 0) {
			return;
		}
		const timer = setInterval(() => {
			setCooldown((seconds) => seconds - 1);
		}, 1000);
		return () => clearInterval(timer);
	}, [cooldown]);

	function successCallbackURL(): string {
		const url = new URL('/auth/verify-email', window.location.origin);
		url.searchParams.set('state', 'success');
		if (search.redirect) {
			url.searchParams.set('redirect', search.redirect);
		}
		return `${url.pathname}${url.search}`;
	}

	async function onSubmit(values: VerifyEmailValues) {
		setServerError(null);

		try {
			const res = await authClient.sendVerificationEmail({
				email: values.email,
				callbackURL: successCallbackURL(),
			});
			if (res.error) {
				setServerError(
					res.error.message ??
						'Unable to send the verification email. Please try again.',
				);
				return;
			}
			setSent(true);
			setCooldown(RESEND_COOLDOWN_SECONDS);
			toast.success('Verification email sent. Check your inbox.');
		} catch (_err) {
			setServerError(
				'Network error while sending the email. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please enter a valid email address.');
	}

	if (search.state === 'success') {
		const destination = search.redirect ?? '/dashboard';
		return (
			<AuthCard
				title="Email verified"
				subtitle="Your account is fully activated — welcome to the academy."
			>
				<div className="mt-6 space-y-5">
					<AuthAlert tone="success" message="You're ready to continue." />
					<Button
						size="lg"
						className="w-full"
						onClick={() => {
							router.invalidate();
							router.history.push(destination);
						}}
					>
						Go to Dashboard
					</Button>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			title="Check your inbox"
			subtitle="We sent a verification link to your email address. Click it to activate your account."
		>
			<div className="mt-6">
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit, onInvalid)}
					className="flex flex-col gap-5"
				>
					<div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
						<p className="text-muted-foreground">Verification sent to</p>
						<p className="mt-0.5 font-medium break-all">
							{search.email ?? 'your email address'}
						</p>
					</div>

					{search.email ? (
						<input type="hidden" {...register('email')} />
					) : (
						<Field data-invalid={!!errors.email}>
							<FieldLabel htmlFor="email">Email address</FieldLabel>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="you@example.com"
								aria-invalid={!!errors.email}
								aria-describedby={
									errors.email ? 'verify-email-error' : undefined
								}
								{...register('email')}
							/>
							<FieldError id="verify-email-error" errors={[errors.email]} />
						</Field>
					)}

					{sent ? (
						<AuthAlert
							tone="success"
							message="If that email belongs to an academy account, a fresh verification link is on its way."
						/>
					) : null}
					{serverError ? <AuthAlert message={serverError} /> : null}

					<Button
						type="submit"
						variant="outline"
						size="lg"
						className="w-full"
						disabled={isSubmitting || cooldown > 0 || !emailValue}
					>
						{cooldown > 0
							? `Resend available in ${cooldown}s`
							: isSubmitting
								? 'Sending…'
								: 'Resend Verification Email'}
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted-foreground">
					Wrong address or already verified?{' '}
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
