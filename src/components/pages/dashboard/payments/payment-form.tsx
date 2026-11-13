import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconCash } from '@tabler/icons-react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import {
	type PaymentFormValues,
	paymentSchema,
} from '@/components/pages/dashboard/payments/schemas';
import {
	PAYMENT_METHOD_LABELS,
	PAYMENT_METHODS,
} from '@/components/pages/payments/types';
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
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatTaka } from '@/lib/utils';
import {
	type PaymentEnrollmentOption,
	recordPayment,
} from '@/server/admin/payments';

export function PaymentForm({
	options,
	preselectedEnrollmentId,
}: {
	options: PaymentEnrollmentOption[];
	preselectedEnrollmentId?: string;
}) {
	const router = useRouter();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const initialEnrollmentId =
		options.find((option) => option.id === preselectedEnrollmentId)?.id ??
		options[0]?.id ??
		'';
	const initialBalance =
		options.find((option) => option.id === initialEnrollmentId)?.balance ?? 0;

	const {
		register,
		control,
		watch,
		setValue,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PaymentFormValues>({
		resolver: zodResolver(paymentSchema),
		defaultValues: {
			enrollmentId: initialEnrollmentId,
			amount: initialBalance > 0 ? initialBalance : 0,
			method: 'cash',
			reference: '',
			note: '',
			paidAt: new Date().toISOString().slice(0, 10),
		},
		mode: 'onTouched',
	});

	const selectedId = watch('enrollmentId');
	const selected = options.find((option) => option.id === selectedId);

	async function onSubmit(values: PaymentFormValues) {
		setServerError(null);

		try {
			await recordPayment({ data: values });
			toast.success('Payment recorded.');
			await router.invalidate();
			await navigate({ to: '/dashboard/payments' });
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not record the payment. Please try again.',
			);
		}
	}

	if (options.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>No students to charge yet</CardTitle>
					<CardDescription>
						Payments are recorded against approved students. Approve an
						application first, then come back here.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						variant="outline"
						render={<Link to="/dashboard/applications" />}
					>
						<IconArrowLeft stroke={1.75} />
						Go to applications
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<form
			noValidate
			onSubmit={handleSubmit(onSubmit, () =>
				toast.error('Please fix the highlighted fields and try again.'),
			)}
			className="flex flex-col gap-6"
		>
			<Card>
				<CardHeader>
					<CardTitle>Payment details</CardTitle>
					<CardDescription>
						Record a payment received in cash, mobile wallet or bank transfer.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<Controller
							control={control}
							name="enrollmentId"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="enrollmentId">Student</FieldLabel>
									<Select
										items={options.map((option) => ({
											value: option.id,
											label: option.label,
										}))}
										name={field.name}
										value={field.value}
										onValueChange={(value) => {
											if (!value) {
												return;
											}
											field.onChange(value);
											const next = options.find(
												(option) => option.id === value,
											);
											if (next && next.balance > 0) {
												setValue('amount', next.balance, {
													shouldValidate: true,
												});
											}
										}}
									>
										<SelectTrigger
											id="enrollmentId"
											className="w-full"
											aria-invalid={fieldState.invalid}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Choose a student" />
										</SelectTrigger>
										<SelectContent>
											{options.map((option) => (
												<SelectItem key={option.id} value={option.id}>
													{option.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{selected ? (
										<FieldDescription>
											Due {formatTaka(selected.totalDue)} · paid{' '}
											{formatTaka(selected.totalPaid)} · balance{' '}
											{formatTaka(selected.balance)}
										</FieldDescription>
									) : null}
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<div className="grid gap-6 sm:grid-cols-2">
							<Field data-invalid={!!errors.amount}>
								<FieldLabel htmlFor="amount">Amount (৳)</FieldLabel>
								<Input
									id="amount"
									type="number"
									inputMode="numeric"
									min={1}
									aria-invalid={!!errors.amount}
									{...register('amount', { valueAsNumber: true })}
								/>
								{selected && selected.balance > 0 ? (
									<FieldDescription>
										Balance remaining: {formatTaka(selected.balance)}
									</FieldDescription>
								) : null}
								<FieldError errors={[errors.amount]} />
							</Field>

							<Field data-invalid={!!errors.paidAt}>
								<FieldLabel htmlFor="paidAt">Payment date</FieldLabel>
								<Input
									id="paidAt"
									type="date"
									aria-invalid={!!errors.paidAt}
									{...register('paidAt')}
								/>
								<FieldError errors={[errors.paidAt]} />
							</Field>
						</div>

						<div className="grid gap-6 sm:grid-cols-2">
							<Controller
								control={control}
								name="method"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="method">Method</FieldLabel>
										<Select
											items={PAYMENT_METHODS.map((method) => ({
												value: method,
												label: PAYMENT_METHOD_LABELS[method],
											}))}
											name={field.name}
											value={field.value}
											onValueChange={(value) => {
												if (value) {
													field.onChange(value);
												}
											}}
										>
											<SelectTrigger
												id="method"
												className="w-full"
												aria-invalid={fieldState.invalid}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Choose a method" />
											</SelectTrigger>
											<SelectContent>
												{PAYMENT_METHODS.map((method) => (
													<SelectItem key={method} value={method}>
														{PAYMENT_METHOD_LABELS[method]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>

							<Field data-invalid={!!errors.reference}>
								<FieldLabel htmlFor="reference">
									Reference (optional)
								</FieldLabel>
								<Input
									id="reference"
									placeholder="Transaction ID or receipt no."
									aria-invalid={!!errors.reference}
									{...register('reference')}
								/>
								<FieldError errors={[errors.reference]} />
							</Field>
						</div>

						<Field data-invalid={!!errors.note}>
							<FieldLabel htmlFor="note">Note (optional)</FieldLabel>
							<Textarea
								id="note"
								rows={2}
								className="min-h-16 resize-y"
								placeholder="Anything worth remembering about this payment."
								aria-invalid={!!errors.note}
								{...register('note')}
							/>
							<FieldError errors={[errors.note]} />
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			{serverError ? <AuthAlert message={serverError} /> : null}

			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					render={<Link to="/dashboard/payments" />}
				>
					<IconArrowLeft stroke={1.75} />
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					<IconCash stroke={1.75} />
					{isSubmitting ? 'Recording…' : 'Record payment'}
				</Button>
			</div>
		</form>
	);
}
