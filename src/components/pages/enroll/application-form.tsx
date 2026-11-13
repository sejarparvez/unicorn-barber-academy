import { zodResolver } from '@hookform/resolvers/zod';
import {
	IconArrowRight,
	IconCalendarEvent,
	IconCheck,
	IconClock,
	IconCurrencyTaka,
	IconUsers,
} from '@tabler/icons-react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { differenceInYears, parseISO } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
import {
	type AdmissionFormValues,
	admissionFormSchema,
	GENDERS,
} from '@/components/pages/enroll/schemas';
import {
	ENROLLMENT_STATUS_META,
	formatBatchDate,
} from '@/components/pages/enroll/types';
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
import type { EnrollmentTarget } from '@/server/batches';
import { applyToBatch } from '@/server/batches';

function formatPrice(amount: number) {
	return `৳${amount.toLocaleString('en-US')}`;
}

export function ApplicationForm({ target }: { target: EnrollmentTarget }) {
	const { batch, program, existingStatus } = target;

	if (existingStatus) {
		const meta = ENROLLMENT_STATUS_META[existingStatus];

		return (
			<Card>
				<CardHeader>
					<CardTitle>You&apos;ve already applied</CardTitle>
					<CardDescription>
						Your application for the {batch.name} {program.title} batch is on
						file.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<AuthAlert
						tone="success"
						message={`Current status: ${meta.label}.`}
					/>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button
							nativeButton={false}
							render={<Link to="/dashboard/my-programs" />}
						>
							View my programs
						</Button>
						<Button
							nativeButton={false}
							variant="outline"
							render={
								<Link to="/programs/$slug" params={{ slug: program.slug }} />
							}
						>
							Back to program
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<BatchSummary target={target} />
			<AdmissionForm target={target} />
		</div>
	);
}

function BatchSummary({ target }: { target: EnrollmentTarget }) {
	const { batch, program } = target;

	return (
		<Card className="border border-primary/25 bg-primary/[0.04]">
			<CardContent className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							{program.title}
						</p>
						<p className="mt-1.5 font-semibold text-xl text-foreground tracking-tight">
							{batch.name} batch
						</p>
					</div>
					<span className="rounded-full border border-primary/30 px-3 py-1 font-semibold text-[10px] text-primary uppercase tracking-[0.14em]">
						{batch.seatsRemaining} seats left
					</span>
				</div>

				<dl className="flex flex-col gap-2.5 text-sm">
					<div className="flex items-center gap-3">
						<IconCalendarEvent
							className="size-4 shrink-0 text-primary/80"
							stroke={1.6}
							aria-hidden="true"
						/>
						<dd className="text-muted-foreground">
							Starts {formatBatchDate(batch.startDate)}
							{batch.endDate ? ` · ends ${formatBatchDate(batch.endDate)}` : ''}
						</dd>
					</div>
					<div className="flex items-center gap-3">
						<IconClock
							className="size-4 shrink-0 text-primary/80"
							stroke={1.6}
							aria-hidden="true"
						/>
						<dd className="text-muted-foreground">{batch.schedule}</dd>
					</div>
					<div className="flex items-center gap-3">
						<IconUsers
							className="size-4 shrink-0 text-primary/80"
							stroke={1.6}
							aria-hidden="true"
						/>
						<dd className="text-muted-foreground">
							{batch.seatsTaken} of {batch.capacity} seats taken
						</dd>
					</div>
					<div className="flex items-center gap-3">
						<IconCurrencyTaka
							className="size-4 shrink-0 text-primary/80"
							stroke={1.6}
							aria-hidden="true"
						/>
						<dd className="text-muted-foreground">
							Tuition {formatPrice(program.price)}
						</dd>
					</div>
				</dl>
			</CardContent>
		</Card>
	);
}

function SectionCard({
	step,
	title,
	description,
	children,
}: {
	step: number;
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-3">
					<span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 font-semibold text-[11px] text-primary">
						{step}
					</span>
					<div>
						<CardTitle>{title}</CardTitle>
						<CardDescription className="mt-0.5">{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function AdmissionForm({ target }: { target: EnrollmentTarget }) {
	const router = useRouter();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		control,
		watch,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AdmissionFormValues>({
		resolver: zodResolver(admissionFormSchema),
		defaultValues: {
			fullName: target.defaults.fullName,
			fatherName: '',
			motherName: '',
			dateOfBirth: '',
			nationality: 'Bangladeshi',
			nidNumber: '',
			phone: '',
			whatsapp: target.defaults.whatsapp,
			presentAddress: '',
			permanentAddress: '',
			emergencyName: '',
			emergencyRelation: '',
			emergencyMobile: '',
			emergencyAddress: '',
			education: '',
			hasBarberingExperience: false,
			barberingExperienceDuration: '',
			hasPreviousTraining: false,
			previousTrainingInstitution: '',
			goal: '',
		},
		mode: 'onTouched',
	});

	const dateOfBirth = watch('dateOfBirth');
	const hasBarberingExperience = watch('hasBarberingExperience');
	const hasPreviousTraining = watch('hasPreviousTraining');

	const age = (() => {
		if (!dateOfBirth || Number.isNaN(Date.parse(dateOfBirth))) {
			return null;
		}
		return differenceInYears(new Date(), parseISO(dateOfBirth));
	})();

	async function onSubmit(values: AdmissionFormValues) {
		setServerError(null);

		try {
			await applyToBatch({
				data: { batchId: target.batch.id, ...values },
			});
			toast.success('Application submitted.');
			await router.invalidate();
			await navigate({ to: '/dashboard/my-programs' });
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not submit your application. Please try again.',
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
			<SectionCard
				step={1}
				title="Student information"
				description="Tell us who is applying, exactly as it appears on official documents."
			>
				<FieldGroup className="gap-6">
					<Field data-invalid={!!errors.fullName}>
						<FieldLabel htmlFor="fullName">Full name</FieldLabel>
						<Input
							id="fullName"
							autoComplete="name"
							placeholder="As on your NID or birth certificate"
							aria-invalid={!!errors.fullName}
							{...register('fullName')}
						/>
						<FieldError errors={[errors.fullName]} />
					</Field>

					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.fatherName}>
							<FieldLabel htmlFor="fatherName">Father&apos;s name</FieldLabel>
							<Input
								id="fatherName"
								aria-invalid={!!errors.fatherName}
								{...register('fatherName')}
							/>
							<FieldError errors={[errors.fatherName]} />
						</Field>

						<Field data-invalid={!!errors.motherName}>
							<FieldLabel htmlFor="motherName">Mother&apos;s name</FieldLabel>
							<Input
								id="motherName"
								aria-invalid={!!errors.motherName}
								{...register('motherName')}
							/>
							<FieldError errors={[errors.motherName]} />
						</Field>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.dateOfBirth}>
							<FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
							<Input
								id="dateOfBirth"
								type="date"
								max={new Date().toISOString().slice(0, 10)}
								aria-invalid={!!errors.dateOfBirth}
								{...register('dateOfBirth')}
							/>
							{age !== null ? (
								<FieldDescription>Age: {age} years</FieldDescription>
							) : null}
							<FieldError errors={[errors.dateOfBirth]} />
						</Field>

						<Controller
							control={control}
							name="gender"
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="gender">Gender</FieldLabel>
									<Select
										items={GENDERS.map((gender) => ({
											value: gender,
											label: gender,
										}))}
										name={field.name}
										value={field.value ?? ''}
										onValueChange={(value) => {
											if (value) {
												field.onChange(value);
											}
										}}
									>
										<SelectTrigger
											id="gender"
											className="w-full"
											aria-invalid={fieldState.invalid}
											onBlur={field.onBlur}
										>
											<SelectValue placeholder="Choose gender" />
										</SelectTrigger>
										<SelectContent>
											{GENDERS.map((gender) => (
												<SelectItem key={gender} value={gender}>
													{gender}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FieldError errors={[fieldState.error]} />
								</Field>
							)}
						/>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.nationality}>
							<FieldLabel htmlFor="nationality">Nationality</FieldLabel>
							<Input
								id="nationality"
								aria-invalid={!!errors.nationality}
								{...register('nationality')}
							/>
							<FieldError errors={[errors.nationality]} />
						</Field>

						<Field data-invalid={!!errors.nidNumber}>
							<FieldLabel htmlFor="nidNumber">
								NID / birth certificate no.
							</FieldLabel>
							<Input
								id="nidNumber"
								inputMode="numeric"
								aria-invalid={!!errors.nidNumber}
								{...register('nidNumber')}
							/>
							<FieldError errors={[errors.nidNumber]} />
						</Field>
					</div>
				</FieldGroup>
			</SectionCard>

			<SectionCard
				step={2}
				title="Contact information"
				description="How we reach you and where you are based."
			>
				<FieldGroup className="gap-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.phone}>
							<FieldLabel htmlFor="phone">Mobile number</FieldLabel>
							<Input
								id="phone"
								type="tel"
								inputMode="tel"
								placeholder="+880 1XXX XXXXXX"
								autoComplete="tel"
								aria-invalid={!!errors.phone}
								{...register('phone')}
							/>
							<FieldError errors={[errors.phone]} />
						</Field>

						<Field data-invalid={!!errors.whatsapp}>
							<FieldLabel htmlFor="whatsapp">
								WhatsApp / email (optional)
							</FieldLabel>
							<Input
								id="whatsapp"
								placeholder="WhatsApp number or email address"
								aria-invalid={!!errors.whatsapp}
								{...register('whatsapp')}
							/>
							<FieldError errors={[errors.whatsapp]} />
						</Field>
					</div>

					<Field data-invalid={!!errors.presentAddress}>
						<FieldLabel htmlFor="presentAddress">Present address</FieldLabel>
						<Textarea
							id="presentAddress"
							rows={2}
							className="min-h-16 resize-y"
							aria-invalid={!!errors.presentAddress}
							{...register('presentAddress')}
						/>
						<FieldError errors={[errors.presentAddress]} />
					</Field>

					<Field data-invalid={!!errors.permanentAddress}>
						<FieldLabel htmlFor="permanentAddress">
							Permanent address
						</FieldLabel>
						<Textarea
							id="permanentAddress"
							rows={2}
							className="min-h-16 resize-y"
							aria-invalid={!!errors.permanentAddress}
							{...register('permanentAddress')}
						/>
						<FieldError errors={[errors.permanentAddress]} />
					</Field>
				</FieldGroup>
			</SectionCard>

			<SectionCard
				step={3}
				title="Emergency contact"
				description="Someone we can call if we cannot reach you."
			>
				<FieldGroup className="gap-6">
					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.emergencyName}>
							<FieldLabel htmlFor="emergencyName">Name</FieldLabel>
							<Input
								id="emergencyName"
								aria-invalid={!!errors.emergencyName}
								{...register('emergencyName')}
							/>
							<FieldError errors={[errors.emergencyName]} />
						</Field>

						<Field data-invalid={!!errors.emergencyRelation}>
							<FieldLabel htmlFor="emergencyRelation">Relation</FieldLabel>
							<Input
								id="emergencyRelation"
								placeholder="Father, spouse, guardian…"
								aria-invalid={!!errors.emergencyRelation}
								{...register('emergencyRelation')}
							/>
							<FieldError errors={[errors.emergencyRelation]} />
						</Field>
					</div>

					<div className="grid gap-6 sm:grid-cols-2">
						<Field data-invalid={!!errors.emergencyMobile}>
							<FieldLabel htmlFor="emergencyMobile">Mobile</FieldLabel>
							<Input
								id="emergencyMobile"
								type="tel"
								inputMode="tel"
								aria-invalid={!!errors.emergencyMobile}
								{...register('emergencyMobile')}
							/>
							<FieldError errors={[errors.emergencyMobile]} />
						</Field>

						<Field data-invalid={!!errors.emergencyAddress}>
							<FieldLabel htmlFor="emergencyAddress">
								Address (optional)
							</FieldLabel>
							<Input
								id="emergencyAddress"
								aria-invalid={!!errors.emergencyAddress}
								{...register('emergencyAddress')}
							/>
							<FieldError errors={[errors.emergencyAddress]} />
						</Field>
					</div>
				</FieldGroup>
			</SectionCard>

			<SectionCard
				step={4}
				title="Education & previous experience"
				description="Your background helps us place you in the right batch."
			>
				<FieldGroup className="gap-6">
					<Field data-invalid={!!errors.education}>
						<FieldLabel htmlFor="education">Education</FieldLabel>
						<Input
							id="education"
							placeholder="Highest level completed, e.g. SSC, HSC, Bachelor's"
							aria-invalid={!!errors.education}
							{...register('education')}
						/>
						<FieldError errors={[errors.education]} />
					</Field>

					<Field orientation="horizontal">
						<input
							id="hasBarberingExperience"
							type="checkbox"
							className="size-4 shrink-0 rounded border-input accent-primary"
							{...register('hasBarberingExperience')}
						/>
						<div className="flex flex-col gap-1">
							<FieldLabel htmlFor="hasBarberingExperience">
								I have previous barbering experience
							</FieldLabel>
							<FieldDescription>
								Leave unchecked if you are completely new to barbering.
							</FieldDescription>
						</div>
					</Field>

					{hasBarberingExperience ? (
						<Field data-invalid={!!errors.barberingExperienceDuration}>
							<FieldLabel htmlFor="barberingExperienceDuration">
								Experience & duration
							</FieldLabel>
							<Textarea
								id="barberingExperienceDuration"
								rows={2}
								className="min-h-16 resize-y"
								placeholder="Where you worked and for how long, e.g. 1 year at a local salon."
								aria-invalid={!!errors.barberingExperienceDuration}
								{...register('barberingExperienceDuration')}
							/>
							<FieldError errors={[errors.barberingExperienceDuration]} />
						</Field>
					) : null}

					<Field orientation="horizontal">
						<input
							id="hasPreviousTraining"
							type="checkbox"
							className="size-4 shrink-0 rounded border-input accent-primary"
							{...register('hasPreviousTraining')}
						/>
						<div className="flex flex-col gap-1">
							<FieldLabel htmlFor="hasPreviousTraining">
								I have trained at another institution before
							</FieldLabel>
						</div>
					</Field>

					{hasPreviousTraining ? (
						<Field data-invalid={!!errors.previousTrainingInstitution}>
							<FieldLabel htmlFor="previousTrainingInstitution">
								Institution
							</FieldLabel>
							<Input
								id="previousTrainingInstitution"
								aria-invalid={!!errors.previousTrainingInstitution}
								{...register('previousTrainingInstitution')}
							/>
							<FieldError errors={[errors.previousTrainingInstitution]} />
						</Field>
					) : null}

					<Field data-invalid={!!errors.goal}>
						<FieldLabel htmlFor="goal">Your goal for this course</FieldLabel>
						<Textarea
							id="goal"
							rows={3}
							className="min-h-20 resize-y"
							placeholder="What do you want to do after completing the program?"
							aria-invalid={!!errors.goal}
							{...register('goal')}
						/>
						<FieldError errors={[errors.goal]} />
					</Field>
				</FieldGroup>
			</SectionCard>

			{serverError ? <AuthAlert message={serverError} /> : null}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Button
					type="submit"
					size="lg"
					disabled={isSubmitting}
					className="glow-gold h-11 gap-2 font-semibold text-[12px] tracking-[0.16em]"
				>
					{isSubmitting ? 'Submitting…' : 'SUBMIT APPLICATION'}
					<IconArrowRight className="size-4" stroke={1.75} />
				</Button>
				<p className="flex items-center gap-1.5 text-muted-foreground text-xs">
					<IconCheck
						className="size-3.5 text-primary"
						stroke={1.8}
						aria-hidden="true"
					/>
					No payment is taken at this stage.
				</p>
			</div>
		</form>
	);
}
