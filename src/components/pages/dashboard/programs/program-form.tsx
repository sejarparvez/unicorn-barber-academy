import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconPlus, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import {
	type Control,
	Controller,
	useFieldArray,
	useForm,
} from 'react-hook-form';
import { toast } from 'sonner';
import { AuthAlert } from '@/components/pages/auth/auth-alert';
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
import { createProgram, updateProgram } from '@/server/admin/programs';
import {
	PROGRAM_CATEGORIES,
	type ProgramFormValues,
	programSchema,
} from './schemas';

const CATEGORY_OPTIONS = PROGRAM_CATEGORIES.map((category) => ({
	value: category,
	label: category,
}));

type ListFieldName = 'highlights' | 'whoFor' | 'careerPaths';

export function createEmptyProgram(position: number): ProgramFormValues {
	return {
		title: '',
		slug: '',
		category: 'Barbering',
		level: '',
		duration: '',
		tagline: '',
		description: '',
		highlights: [''],
		outcome: '',
		whoFor: [''],
		careerPaths: [''],
		curriculum: [{ title: '', description: '' }],
		price: 0,
		position,
		featured: false,
		hidden: false,
	};
}

type ProgramFormProps = {
	mode: 'create' | 'edit';
	programId?: string;
	defaultValues: ProgramFormValues;
};

export function ProgramForm({
	mode,
	programId,
	defaultValues,
}: ProgramFormProps) {
	const router = useRouter();
	const navigate = useNavigate();
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ProgramFormValues>({
		resolver: zodResolver(programSchema),
		defaultValues,
		mode: 'onTouched',
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'curriculum',
	});

	async function onSubmit(values: ProgramFormValues) {
		setServerError(null);

		try {
			if (mode === 'edit' && programId) {
				await updateProgram({ data: { id: programId, ...values } });
				toast.success('Program updated.');
			} else {
				await createProgram({ data: values });
				toast.success('Program created.');
			}

			await router.invalidate();
			await navigate({ to: '/dashboard/programs' });
		} catch (error) {
			setServerError(
				error instanceof Error
					? error.message
					: 'Could not save the program. Please try again.',
			);
		}
	}

	function onInvalid() {
		toast.error('Please fix the highlighted fields and try again.');
	}

	return (
		<form
			noValidate
			onSubmit={handleSubmit(onSubmit, onInvalid)}
			className="flex flex-col gap-6"
		>
			<Card>
				<CardHeader>
					<CardTitle>Program details</CardTitle>
					<CardDescription>
						The core information shown across the public program pages.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<div className="grid gap-6 sm:grid-cols-2">
							<Field data-invalid={!!errors.title}>
								<FieldLabel htmlFor="title">Title</FieldLabel>
								<Input
									id="title"
									placeholder="Classic Barbering"
									aria-invalid={!!errors.title}
									{...register('title')}
								/>
								<FieldError errors={[errors.title]} />
							</Field>

							<Field data-invalid={!!errors.slug}>
								<FieldLabel htmlFor="slug">Slug</FieldLabel>
								<Input
									id="slug"
									placeholder="classic-barbering"
									aria-invalid={!!errors.slug}
									{...register('slug')}
								/>
								<FieldDescription>
									Used in the URL: /programs/your-slug
								</FieldDescription>
								<FieldError errors={[errors.slug]} />
							</Field>
						</div>

						<div className="grid gap-6 sm:grid-cols-3">
							<Controller
								control={control}
								name="category"
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="category">Category</FieldLabel>
										<Select
											items={CATEGORY_OPTIONS}
											name={field.name}
											value={field.value}
											onValueChange={(value) => {
												if (value) {
													field.onChange(value);
												}
											}}
										>
											<SelectTrigger
												id="category"
												className="w-full"
												aria-invalid={fieldState.invalid}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Choose a category" />
											</SelectTrigger>
											<SelectContent>
												{PROGRAM_CATEGORIES.map((category) => (
													<SelectItem key={category} value={category}>
														{category}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError errors={[fieldState.error]} />
									</Field>
								)}
							/>

							<Field data-invalid={!!errors.level}>
								<FieldLabel htmlFor="level">Level</FieldLabel>
								<Input
									id="level"
									placeholder="Beginner friendly"
									aria-invalid={!!errors.level}
									{...register('level')}
								/>
								<FieldError errors={[errors.level]} />
							</Field>

							<Field data-invalid={!!errors.duration}>
								<FieldLabel htmlFor="duration">Duration</FieldLabel>
								<Input
									id="duration"
									placeholder="12 weeks"
									aria-invalid={!!errors.duration}
									{...register('duration')}
								/>
								<FieldError errors={[errors.duration]} />
							</Field>
						</div>

						<div className="grid gap-6 sm:grid-cols-2">
							<Field data-invalid={!!errors.price}>
								<FieldLabel htmlFor="price">Price (BDT)</FieldLabel>
								<Input
									id="price"
									type="number"
									inputMode="numeric"
									min={0}
									step={1000}
									aria-invalid={!!errors.price}
									{...register('price', { valueAsNumber: true })}
								/>
								<FieldError errors={[errors.price]} />
							</Field>

							<Field data-invalid={!!errors.position}>
								<FieldLabel htmlFor="position">Position</FieldLabel>
								<Input
									id="position"
									type="number"
									inputMode="numeric"
									min={1}
									aria-invalid={!!errors.position}
									{...register('position', { valueAsNumber: true })}
								/>
								<FieldDescription>
									Controls catalogue order and numbering.
								</FieldDescription>
								<FieldError errors={[errors.position]} />
							</Field>
						</div>

						<Field data-invalid={!!errors.tagline}>
							<FieldLabel htmlFor="tagline">Tagline</FieldLabel>
							<Input
								id="tagline"
								placeholder="Foundations, fades and classic cuts"
								aria-invalid={!!errors.tagline}
								{...register('tagline')}
							/>
							<FieldError errors={[errors.tagline]} />
						</Field>

						<Field data-invalid={!!errors.description}>
							<FieldLabel htmlFor="description">Description</FieldLabel>
							<Textarea
								id="description"
								rows={4}
								className="min-h-28 resize-y"
								aria-invalid={!!errors.description}
								{...register('description')}
							/>
							<FieldError errors={[errors.description]} />
						</Field>

						<Field data-invalid={!!errors.outcome}>
							<FieldLabel htmlFor="outcome">Outcome</FieldLabel>
							<Textarea
								id="outcome"
								rows={3}
								className="min-h-20 resize-y"
								aria-invalid={!!errors.outcome}
								{...register('outcome')}
							/>
							<FieldError errors={[errors.outcome]} />
						</Field>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Highlights &amp; audience</CardTitle>
					<CardDescription>
						One entry per line. Blank lines are ignored.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-6">
						<ListField
							control={control}
							name="highlights"
							label="Highlights"
							description="Short selling points shown on the program card."
							placeholder={
								'Clipper & shear work\nClassic cuts\nLive client days'
							}
						/>
						<ListField
							control={control}
							name="whoFor"
							label="Who it's for"
							description="The kinds of students this program suits."
							placeholder={'Complete beginners\nCareer changers'}
						/>
						<ListField
							control={control}
							name="careerPaths"
							label="Career paths"
							description="Where graduates typically go next."
							placeholder={'Junior barber\nMobile barber'}
						/>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Curriculum</CardTitle>
					<CardDescription>
						Modules are shown in the order listed here.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{fields.map((field, index) => (
						<div
							key={field.id}
							className="flex flex-col gap-4 rounded-xl border border-border/70 bg-muted/30 p-4"
						>
							<div className="flex items-center justify-between gap-4">
								<span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
									Module {String(index + 1).padStart(2, '0')}
								</span>
								<Button
									type="button"
									variant="ghost"
									size="icon-sm"
									disabled={fields.length === 1}
									onClick={() => remove(index)}
									aria-label={`Remove module ${index + 1}`}
								>
									<IconTrash stroke={1.75} />
								</Button>
							</div>

							<Field data-invalid={!!errors.curriculum?.[index]?.title}>
								<FieldLabel htmlFor={`curriculum-${index}-title`}>
									Title
								</FieldLabel>
								<Input
									id={`curriculum-${index}-title`}
									placeholder="Foundations & tool craft"
									aria-invalid={!!errors.curriculum?.[index]?.title}
									{...register(`curriculum.${index}.title`)}
								/>
								<FieldError errors={[errors.curriculum?.[index]?.title]} />
							</Field>

							<Field data-invalid={!!errors.curriculum?.[index]?.description}>
								<FieldLabel htmlFor={`curriculum-${index}-description`}>
									Description
								</FieldLabel>
								<Textarea
									id={`curriculum-${index}-description`}
									rows={2}
									className="min-h-16 resize-y"
									aria-invalid={!!errors.curriculum?.[index]?.description}
									{...register(`curriculum.${index}.description`)}
								/>
								<FieldError
									errors={[errors.curriculum?.[index]?.description]}
								/>
							</Field>
						</div>
					))}

					{errors.curriculum?.message ? (
						<FieldError>{errors.curriculum.message}</FieldError>
					) : null}

					<Button
						type="button"
						variant="outline"
						className="self-start"
						onClick={() => append({ title: '', description: '' })}
					>
						<IconPlus stroke={1.75} />
						Add module
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Visibility</CardTitle>
					<CardDescription>
						Control where this program appears across the site.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-5">
						<Field orientation="horizontal">
							<input
								id="featured"
								type="checkbox"
								className="size-4 shrink-0 rounded border-input accent-primary"
								{...register('featured')}
							/>
							<div className="flex flex-col gap-1">
								<FieldLabel htmlFor="featured">Featured</FieldLabel>
								<FieldDescription>
									Highlight this program on the home page.
								</FieldDescription>
							</div>
						</Field>

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
									Hide this program from the public site. Admins can still
									manage it here.
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
					render={<Link to="/dashboard/programs" />}
				>
					<IconArrowLeft stroke={1.75} />
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? 'Saving…'
						: mode === 'edit'
							? 'Save changes'
							: 'Create program'}
				</Button>
			</div>
		</form>
	);
}

function ListField({
	control,
	name,
	label,
	description,
	placeholder,
}: {
	control: Control<ProgramFormValues>;
	name: ListFieldName;
	label: string;
	description: string;
	placeholder: string;
}) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const value = Array.isArray(field.value) ? field.value : [];

				return (
					<Field data-invalid={fieldState.invalid}>
						<FieldLabel htmlFor={name}>{label}</FieldLabel>
						<Textarea
							id={name}
							rows={4}
							className="min-h-28 resize-y"
							placeholder={placeholder}
							aria-invalid={fieldState.invalid}
							value={value.join('\n')}
							onChange={(event) =>
								field.onChange(event.target.value.split('\n'))
							}
							onBlur={field.onBlur}
						/>
						<FieldDescription>{description}</FieldDescription>
						<FieldError errors={[fieldState.error]} />
					</Field>
				);
			}}
		/>
	);
}
