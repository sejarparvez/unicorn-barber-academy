import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft } from '@tabler/icons-react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import {
	BATCH_STATUS_LABELS,
	BATCH_STATUSES,
	type BatchFormValues,
	batchSchema,
} from '@/components/pages/dashboard/batches/schemas';
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
import { createBatch, updateBatch } from '@/server/admin/batches';

type ProgramChoice = { id: string; title: string };

type BatchFormProps = {
	mode: 'create' | 'edit';
	batchId?: string;
	programs: ProgramChoice[];
	defaultValues: BatchFormValues;
};

export function BatchForm({
	mode,
	batchId,
	programs,
	defaultValues,
}: BatchFormProps) {
	const router = useRouter();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<BatchFormValues>({
		resolver: zodResolver(batchSchema),
		defaultValues,
		mode: 'onTouched',
	});

	async function onSubmit(values: BatchFormValues) {
		setServerError(null);

		try {
			if (mode === 'edit' && batchId) {
				await updateBatch({ data: { id: batchId, ...values } });
				toast.success('Batch updated.');
			} else {
				await createBatch({ data: values });
				toast.success('Batch created.');
			}

			await router.invalidate();
			await navigate({ to: '/dashboard/batches' });
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not save the batch. Please try again.',
			);
		}
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
					<CardTitle>Batch details</CardTitle>
					<CardDescription>
						A cohort of a program — for example a morning or evening intake.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<Controller
							control={control}
							name="programId"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="programId">Program</FieldLabel>
									<Select
										items={programs.map((program) => ({
											value: program.id,
											label: program.title,
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
											id="programId"
											className="w-full"
											aria-invalid={fieldState.invalid}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Choose a program" />
										</SelectTrigger>
										<SelectContent>
											{programs.map((program) => (
												<SelectItem key={program.id} value={program.id}>
													{program.title}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>

						<Field data-invalid={!!errors.name}>
							<FieldLabel htmlFor="name">Batch name</FieldLabel>
							<Input
								id="name"
								placeholder="Morning"
								aria-invalid={!!errors.name}
								{...register('name')}
							/>
							<FieldDescription>
								Shown to students, e.g. Morning, Evening, Weekend.
							</FieldDescription>
							<FieldError errors={[errors.name]} />
						</Field>

						<div className="grid gap-6 sm:grid-cols-2">
							<Field data-invalid={!!errors.startDate}>
								<FieldLabel htmlFor="startDate">Start date</FieldLabel>
								<Input
									id="startDate"
									type="date"
									aria-invalid={!!errors.startDate}
									{...register('startDate')}
								/>
								<FieldError errors={[errors.startDate]} />
							</Field>

							<Field data-invalid={!!errors.endDate}>
								<FieldLabel htmlFor="endDate">End date (optional)</FieldLabel>
								<Input
									id="endDate"
									type="date"
									aria-invalid={!!errors.endDate}
									{...register('endDate')}
								/>
								<FieldError errors={[errors.endDate]} />
							</Field>
						</div>

						<Field data-invalid={!!errors.schedule}>
							<FieldLabel htmlFor="schedule">Class times</FieldLabel>
							<Input
								id="schedule"
								placeholder="Sat–Thu, 9:00 AM–12:00 PM"
								aria-invalid={!!errors.schedule}
								{...register('schedule')}
							/>
							<FieldError errors={[errors.schedule]} />
						</Field>

						<div className="grid gap-6 sm:grid-cols-2">
							<Field data-invalid={!!errors.capacity}>
								<FieldLabel htmlFor="capacity">Capacity</FieldLabel>
								<Input
									id="capacity"
									type="number"
									inputMode="numeric"
									min={1}
									aria-invalid={!!errors.capacity}
									{...register('capacity', { valueAsNumber: true })}
								/>
								<FieldDescription>
									Applications are blocked once this many seats are taken.
								</FieldDescription>
								<FieldError errors={[errors.capacity]} />
							</Field>

							<Controller
								control={control}
								name="status"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="status">Status</FieldLabel>
										<Select
											items={BATCH_STATUSES.map((status) => ({
												value: status,
												label: BATCH_STATUS_LABELS[status],
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
												id="status"
												className="w-full"
												aria-invalid={fieldState.invalid}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Choose a status" />
											</SelectTrigger>
											<SelectContent>
												{BATCH_STATUSES.map((status) => (
													<SelectItem key={status} value={status}>
														{BATCH_STATUS_LABELS[status]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>
						</div>

						<Field orientation="horizontal">
							<input
								id="hidden"
								type="checkbox"
								className="size-4 shrink-0 rounded border-input accent-primary"
								{...register('hidden')}
							/>
							<div className="flex flex-col gap-1">
								<FieldLabel htmlFor="hidden">Hidden</FieldLabel>
								<FieldDescription>
									Hide this batch from the public site. Admins can still manage
									it here.
								</FieldDescription>
							</div>
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			{serverError ? <AuthAlert message={serverError} /> : null}

			<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					render={<Link to="/dashboard/batches" />}
				>
					<IconArrowLeft stroke={1.75} />
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? 'Saving…'
						: mode === 'edit'
							? 'Save changes'
							: 'Create batch'}
				</Button>
			</div>
		</form>
	);
}
