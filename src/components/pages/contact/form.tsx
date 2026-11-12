import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconCheck, IconSend } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { SectionHeading } from '@/components/pages/home/section-heading';
import type { ProgramOption } from '@/components/pages/programs/types';
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
import ContactDetails from './details';
import { type ContactFormValues, contactSchema } from './form-schema';

const EMPTY_FORM: ContactFormValues = {
	name: '',
	email: '',
	phone: '',
	interest: '',
	message: '',
};

export default function ContactFormSection({
	programs,
}: {
	programs: ProgramOption[];
}) {
	return (
		<section
			aria-labelledby="contact-form-heading"
			className="section-light relative bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
		>
			<div className="mx-auto max-w-7xl">
				<SectionHeading
					id="contact-form-heading"
					as="h1"
					eyebrow="Contact the academy"
					title={
						<>
							Tell us what you want to{' '}
							<span className="text-primary">learn</span>.
						</>
					}
					description="Share a few details and our admissions team will come back with program options, schedules, fees and the next available cohort."
				/>

				<div className="mt-10 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
					<ContactForm programs={programs} />
					<ContactDetails />
				</div>
			</div>
		</section>
	);
}

function ContactForm({ programs }: { programs: ProgramOption[] }) {
	const [submitted, setSubmitted] = useState<ContactFormValues | null>(null);

	const interestOptions = [
		...programs.map((program) => ({
			value: program.slug,
			label: program.title,
		})),
		{ value: 'not-sure', label: 'Not sure yet — help me choose' },
		{ value: 'general', label: 'General enquiry' },
	];

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { errors },
	} = useForm<ContactFormValues>({
		resolver: zodResolver(contactSchema),
		defaultValues: EMPTY_FORM,
		mode: 'onTouched',
	});

	const onSubmit = (values: ContactFormValues) => {
		console.log('[Unicorn contact form] submitted values:', values);
		setSubmitted(values);
		reset(EMPTY_FORM);
	};

	if (submitted) {
		return (
			<Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 border border-primary/25 bg-card shadow-sm ring-0">
				<CardContent className="flex flex-col items-center px-6 py-14 text-center sm:px-10">
					<span className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
						<IconCheck className="size-7" stroke={2} aria-hidden="true" />
					</span>

					<h3
						className="mt-5 font-bold text-2xl text-foreground tracking-tight"
						style={{ fontFamily: 'var(--font-heading)' }}
					>
						Thanks, {submitted.name.split(' ')[0]}.
					</h3>
					<p className="mt-2 max-w-md text-pretty text-muted-foreground text-sm leading-relaxed">
						Your details were captured in the browser. In a live site, our
						admissions team would reply to{' '}
						<span className="font-medium text-foreground">
							{submitted.email}
						</span>{' '}
						within one working day.
					</p>

					<p className="mt-6 max-w-md rounded-lg border border-border/70 bg-muted/60 px-4 py-3 text-pretty text-muted-foreground text-xs leading-relaxed">
						Frontend demo only — no message was sent. Open your browser console
						to see the submitted values.
					</p>

					<Button
						type="button"
						variant="outline"
						size="lg"
						className="mt-6 h-11 gap-2 border-primary/30 px-5 font-semibold text-[12px] text-primary tracking-[0.16em] hover:bg-primary/10 hover:text-primary"
						onClick={() => setSubmitted(null)}
					>
						SEND ANOTHER MESSAGE
						<IconArrowRight className="size-4" stroke={1.75} />
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border border-border/70 bg-card shadow-sm ring-0">
			<CardHeader className="border-border/60 border-b pb-5">
				<CardTitle className="font-bold text-xl tracking-tight">
					Admissions enquiry
				</CardTitle>
				<CardDescription>
					All fields are required unless marked optional.
				</CardDescription>
			</CardHeader>

			<CardContent className="pt-6">
				<form
					noValidate
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-6"
				>
					<FieldGroup>
						<div className="grid gap-5 sm:grid-cols-2">
							<Field data-invalid={!!errors.name}>
								<FieldLabel htmlFor="name">Full name</FieldLabel>
								<Input
									id="name"
									autoComplete="name"
									placeholder="Rahim Ahmed"
									aria-invalid={!!errors.name}
									aria-describedby={errors.name ? 'name-error' : undefined}
									{...register('name')}
								/>
								<FieldError id="name-error" errors={[errors.name]} />
							</Field>

							<Field data-invalid={!!errors.email}>
								<FieldLabel htmlFor="email">Email address</FieldLabel>
								<Input
									id="email"
									type="email"
									autoComplete="email"
									placeholder="you@example.com"
									aria-invalid={!!errors.email}
									aria-describedby={errors.email ? 'email-error' : undefined}
									{...register('email')}
								/>
								<FieldError id="email-error" errors={[errors.email]} />
							</Field>

							<Field data-invalid={!!errors.phone}>
								<FieldLabel htmlFor="phone">
									Phone{' '}
									<span className="font-normal text-muted-foreground">
										(optional)
									</span>
								</FieldLabel>
								<Input
									id="phone"
									type="tel"
									autoComplete="tel"
									placeholder="+880 1XXX XXXXXX"
									aria-invalid={!!errors.phone}
									aria-describedby={errors.phone ? 'phone-error' : undefined}
									{...register('phone')}
								/>
								<FieldError id="phone-error" errors={[errors.phone]} />
							</Field>

							<Field data-invalid={!!errors.interest}>
								<FieldLabel htmlFor="interest">Interested in</FieldLabel>
								<Controller
									control={control}
									name="interest"
									render={({ field }) => (
										<Select
											items={interestOptions}
											name={field.name}
											value={field.value || null}
											onValueChange={(value) => field.onChange(value ?? '')}
										>
											<SelectTrigger
												id="interest"
												className="w-full"
												aria-invalid={!!errors.interest}
												aria-describedby={
													errors.interest ? 'interest-error' : undefined
												}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Choose a program" />
											</SelectTrigger>
											<SelectContent>
												{interestOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								<FieldError id="interest-error" errors={[errors.interest]} />
							</Field>
						</div>

						<Field data-invalid={!!errors.message}>
							<FieldLabel htmlFor="message">Message</FieldLabel>
							<Textarea
								id="message"
								rows={5}
								placeholder="Tell us a little about your goals, your experience and when you would like to start."
								className="min-h-32 resize-y"
								aria-invalid={!!errors.message}
								aria-describedby={errors.message ? 'message-error' : undefined}
								{...register('message')}
							/>
							<FieldDescription>
								Include your preferred schedule if you already know it — day or
								evening.
							</FieldDescription>
							<FieldError id="message-error" errors={[errors.message]} />
						</Field>
					</FieldGroup>

					<div className="flex flex-col gap-4 border-border/60 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
						<p className="max-w-sm text-muted-foreground text-xs leading-relaxed">
							We only use these details to answer your enquiry. Read our{' '}
							<Link
								to="/privacy"
								className="font-medium text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
							>
								privacy policy
							</Link>
							.
						</p>

						<Button
							type="submit"
							size="lg"
							className="glow-gold h-11 shrink-0 gap-2 px-6 font-semibold text-[12px] tracking-[0.16em]"
						>
							SEND MESSAGE
							<IconSend className="size-4" stroke={1.75} />
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
