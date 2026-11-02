// src/features/enrollment/enroll-page.tsx
// Application form (sign-in required — the route gate handles that).
// Program → intake picker, then the full student admission form. On success
// the form is replaced by a confirmation panel with the ENR reference.
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { trackEvent } from "@/components/providers/analytics";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitApplication } from "@/lib/api/enrollment";
import type { Gender, IntakePublic } from "@/lib/enrollment";
import {
	COHORT_LABELS,
	calculateAge,
	formatFeePoisha,
	formatStartsOn,
	GENDER_LABELS,
	GENDERS,
} from "@/lib/enrollment";
import type { SessionPayload } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
	intakes: IntakePublic[];
	session: SessionPayload;
};

const requiredText = (label: string) =>
	z.string().trim().min(1, `${label} is required`);

const enrollSchema = z
	.object({
		programSlug: z.string().min(1, "Please select a program"),
		intakeId: z.number().int().positive("Please select a start date"),
		fullName: requiredText("Full name").max(160),
		fatherName: requiredText("Father's name").max(160),
		motherName: requiredText("Mother's name").max(160),
		dateOfBirth: requiredText("Date of birth"),
		nationality: requiredText("Nationality").max(60),
		gender: requiredText("Gender"),
		nidOrBirthCertNo: z.string().max(60).optional(),
		phone: requiredText("Mobile number").regex(
			/^[+]?[\d\s\-()]{7,20}$/,
			"Enter a valid phone number (e.g. +880 1XXX-XXXXXX)",
		),
		whatsapp: z.string().max(40).optional(),
		presentAddress: requiredText("Present address").max(500),
		permanentAddress: requiredText("Permanent address").max(500),
		emergencyName: requiredText("Emergency contact name").max(160),
		emergencyRelation: requiredText("Emergency contact relation").max(80),
		emergencyMobile: requiredText("Emergency mobile").regex(
			/^[+]?[\d\s\-()]{7,20}$/,
			"Enter a valid mobile number",
		),
		emergencyAddress: requiredText("Emergency contact address").max(500),
		education: requiredText("Education").max(200),
		hasBarberExperience: requiredText("Barbering experience"),
		barberExperiencePeriod: z.string().max(100).optional(),
		hasPriorTraining: requiredText("Previous training"),
		priorTrainingInstitute: z.string().max(200).optional(),
		courseGoal: requiredText("Course goal").max(2000),
		declarationAccepted: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (
			data.hasBarberExperience === "yes" &&
			!data.barberExperiencePeriod?.trim()
		) {
			ctx.addIssue({
				code: "custom",
				path: ["barberExperiencePeriod"],
				message: "Please tell us how long you have been barbering",
			});
		}
		if (
			data.hasPriorTraining === "yes" &&
			!data.priorTrainingInstitute?.trim()
		) {
			ctx.addIssue({
				code: "custom",
				path: ["priorTrainingInstitute"],
				message: "Please enter the institution name",
			});
		}
		if (!data.declarationAccepted) {
			ctx.addIssue({
				code: "custom",
				path: ["declarationAccepted"],
				message: "Please accept the student declaration",
			});
		}
	});

type EnrollValues = z.infer<typeof enrollSchema>;

type FormValues = {
	programSlug: string;
	intakeId: number | null;
	fullName: string;
	fatherName: string;
	motherName: string;
	dateOfBirth: string;
	nationality: string;
	gender: string;
	nidOrBirthCertNo: string;
	phone: string;
	whatsapp: string;
	presentAddress: string;
	permanentAddress: string;
	emergencyName: string;
	emergencyRelation: string;
	emergencyMobile: string;
	emergencyAddress: string;
	education: string;
	hasBarberExperience: "" | "yes" | "no";
	barberExperiencePeriod: string;
	hasPriorTraining: "" | "yes" | "no";
	priorTrainingInstitute: string;
	courseGoal: string;
	declarationAccepted: boolean;
};

const DECLARATION =
	"I declare that the information given in this form is correct to the best of my knowledge. I will follow UBTA's training rules, hygiene and safety requirements, professional conduct, attendance requirements, and the trainer's instructions. I understand that course completion requires participation in the scheduled practical and theory assessments, and that the result will be decided by UBTA's criteria.";

export function EnrollPage({ intakes, session }: Props) {
	const [form, setForm] = useState<FormValues>({
		programSlug: "",
		intakeId: null,
		fullName: session.user.name ?? "",
		fatherName: "",
		motherName: "",
		dateOfBirth: "",
		nationality: "Bangladeshi",
		gender: "",
		nidOrBirthCertNo: "",
		phone: "",
		whatsapp: "",
		presentAddress: "",
		permanentAddress: "",
		emergencyName: "",
		emergencyRelation: "",
		emergencyMobile: "",
		emergencyAddress: "",
		education: "",
		hasBarberExperience: "",
		barberExperiencePeriod: "",
		hasPriorTraining: "",
		priorTrainingInstitute: "",
		courseGoal: "",
		declarationAccepted: false,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [reference, setReference] = useState<string | null>(null);
	const [showConfirm, setShowConfirm] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<
		Partial<Record<keyof EnrollValues, string>>
	>({});

	// Beauty intakes stay in the database/catalog, but this form is for the
	// barbering academy only.
	const barberIntakes = useMemo(
		() => intakes.filter((i) => i.track === "barbering"),
		[intakes],
	);

	const programs = useMemo(() => {
		const seen = new Map<string, string>();
		for (const intake of barberIntakes) {
			if (!seen.has(intake.programSlug)) {
				seen.set(intake.programSlug, intake.programTitle);
			}
		}
		return [...seen.entries()];
	}, [barberIntakes]);

	const programIntakes = useMemo(
		() => barberIntakes.filter((i) => i.programSlug === form.programSlug),
		[barberIntakes, form.programSlug],
	);

	const selectedIntake = intakes.find((i) => i.id === form.intakeId);
	const programFeePoisha = programIntakes[0]?.feePoisha;
	const age = calculateAge(form.dateOfBirth);

	function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
		setForm((prev) => ({ ...prev, [key]: value }));
		setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
	}

	function validate(): boolean {
		const result = enrollSchema.safeParse({
			...form,
			intakeId: form.intakeId ?? 0,
		});
		if (result.success) {
			setFieldErrors({});
			return true;
		}
		const errors: Partial<Record<keyof EnrollValues, string>> = {};
		for (const issue of result.error.issues) {
			const key = issue.path[0] as keyof EnrollValues;
			if (!errors[key]) errors[key] = issue.message;
		}
		setFieldErrors(errors);
		return false;
	}

	function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (submitting) return;
		if (!validate()) return;
		setShowConfirm(true);
	}

	async function onConfirm() {
		if (submitting) return;
		setSubmitting(true);
		setError(null);
		try {
			const result = await submitApplication({
				intakeId: form.intakeId ?? 0,
				fullName: form.fullName.trim(),
				phone: form.phone.trim(),
				fatherName: form.fatherName.trim(),
				motherName: form.motherName.trim(),
				dateOfBirth: form.dateOfBirth,
				nationality: form.nationality.trim(),
				gender: form.gender as Gender,
				nidOrBirthCertNo: form.nidOrBirthCertNo.trim() || null,
				whatsapp: form.whatsapp.trim() || null,
				presentAddress: form.presentAddress.trim(),
				permanentAddress: form.permanentAddress.trim(),
				emergencyName: form.emergencyName.trim(),
				emergencyRelation: form.emergencyRelation.trim(),
				emergencyMobile: form.emergencyMobile.trim(),
				emergencyAddress: form.emergencyAddress.trim(),
				education: form.education.trim(),
				hasBarberExperience: form.hasBarberExperience === "yes",
				barberExperiencePeriod:
					form.hasBarberExperience === "yes"
						? form.barberExperiencePeriod.trim() || null
						: null,
				hasPriorTraining: form.hasPriorTraining === "yes",
				priorTrainingInstitute:
					form.hasPriorTraining === "yes"
						? form.priorTrainingInstitute.trim() || null
						: null,
				courseGoal: form.courseGoal.trim(),
				declarationAccepted: form.declarationAccepted,
			});
			if (result.ok) {
				setReference(result.reference);
				trackEvent("Enrollment Submitted", { program: form.programSlug });
			} else {
				setError(result.message);
				setShowConfirm(false);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Submission failed. Please try again.",
			);
			setShowConfirm(false);
		} finally {
			setSubmitting(false);
		}
	}

	if (reference) {
		return (
			<ConfirmationPanel
				reference={reference}
				email={session.user.email}
				programTitle={selectedIntake?.programTitle ?? form.programSlug}
				cohortLabel={
					selectedIntake ? `${COHORT_LABELS[selectedIntake.cohort]}` : undefined
				}
				startsOn={
					selectedIntake ? formatStartsOn(selectedIntake.startsOn) : undefined
				}
			/>
		);
	}

	return (
		<main>
			<section className="bg-background px-6 pt-28 pb-10 lg:px-10 lg:pt-36">
				<div className="mx-auto max-w-3xl text-center">
					<Badge
						variant="outline"
						className="font-mono text-[10px] tracking-[0.32em] uppercase"
					>
						Admissions
					</Badge>
					<h1 className="mt-4 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
						Secure your seat
					</h1>
					<p className="mt-5 text-base leading-relaxed text-muted-foreground">
						Cohorts are small so instructor time stays one-on-one — apply for
						the intake that fits you and we&rsquo;ll take it from there.
					</p>
				</div>
			</section>

			<section className="bg-background px-6 pb-20 lg:px-10">
				<form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
					{/* Course & intake */}
					<Card>
						<CardHeader>
							<CardTitle>Course & Intake</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<Field>
								<FieldLabel htmlFor="enroll-program">Course *</FieldLabel>
								<Select
									value={form.programSlug}
									onValueChange={(value) => {
										if (value === null) return;
										setForm((prev) => ({
											...prev,
											programSlug: value,
											intakeId: null,
										}));
										setFieldErrors((prev) => ({
											...prev,
											programSlug: undefined,
											intakeId: undefined,
										}));
									}}
								>
									<SelectTrigger id="enroll-program" className="w-full">
										<SelectValue placeholder="Choose a course…" />
									</SelectTrigger>
									<SelectContent>
										{programs.length === 0 ? (
											<SelectItem value="" disabled>
												No open intakes right now
											</SelectItem>
										) : (
											programs.map(([slug, title]) => (
												<SelectItem key={slug} value={slug}>
													{title}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
								{fieldErrors.programSlug ? (
									<FieldError>{fieldErrors.programSlug}</FieldError>
								) : null}
							</Field>

							{form.programSlug ? (
								<Field>
									<FieldLabel>Available batches *</FieldLabel>
									{programIntakes.length === 0 ? (
										<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
											No open intakes for this course yet — check back soon.
										</div>
									) : (
										<div className="grid gap-2">
											{programIntakes.map((intake) => {
												const full = intake.seatsLeft <= 0;
												const selected = form.intakeId === intake.id;
												return (
													<label
														key={intake.id}
														className={cn(
															"flex cursor-pointer items-center justify-between gap-4 rounded-lg border p-4 transition-all",
															selected
																? "border-primary bg-primary/5 shadow-sm"
																: "border-border hover:border-primary/50 hover:bg-muted/30",
															full && "cursor-not-allowed opacity-50",
														)}
													>
														<div className="flex items-center gap-3">
															<input
																type="radio"
																name="intake"
																className="accent-primary"
																checked={selected}
																disabled={full}
																onChange={() => update("intakeId", intake.id)}
															/>
															<div>
																<p className="text-sm font-medium">
																	{COHORT_LABELS[intake.cohort]}
																</p>
																<p className="text-xs text-muted-foreground">
																	Starts {formatStartsOn(intake.startsOn)}
																</p>
															</div>
														</div>
														<Badge
															variant={full ? "destructive" : "outline"}
															className="text-xs"
														>
															{full
																? "Full"
																: `${intake.seatsLeft} / ${intake.seatsTotal} seats`}
														</Badge>
													</label>
												);
											})}
										</div>
									)}
									{fieldErrors.intakeId ? (
										<FieldError>{fieldErrors.intakeId}</FieldError>
									) : null}
								</Field>
							) : null}
						</CardContent>
					</Card>

					{/* Student information */}
					<Card>
						<CardHeader>
							<CardTitle>Student Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<Field>
								<FieldLabel htmlFor="enroll-full-name">Full name *</FieldLabel>
								<Input
									id="enroll-full-name"
									value={form.fullName}
									onChange={(e) => update("fullName", e.target.value)}
									autoComplete="name"
									aria-invalid={!!fieldErrors.fullName}
								/>
								{fieldErrors.fullName ? (
									<FieldError>{fieldErrors.fullName}</FieldError>
								) : null}
							</Field>

							<div className="grid gap-5 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor="enroll-father">
										Father&rsquo;s name *
									</FieldLabel>
									<Input
										id="enroll-father"
										value={form.fatherName}
										onChange={(e) => update("fatherName", e.target.value)}
										aria-invalid={!!fieldErrors.fatherName}
									/>
									{fieldErrors.fatherName ? (
										<FieldError>{fieldErrors.fatherName}</FieldError>
									) : null}
								</Field>
								<Field>
									<FieldLabel htmlFor="enroll-mother">
										Mother&rsquo;s name *
									</FieldLabel>
									<Input
										id="enroll-mother"
										value={form.motherName}
										onChange={(e) => update("motherName", e.target.value)}
										aria-invalid={!!fieldErrors.motherName}
									/>
									{fieldErrors.motherName ? (
										<FieldError>{fieldErrors.motherName}</FieldError>
									) : null}
								</Field>
							</div>

							<div className="grid gap-5 sm:grid-cols-3">
								<Field>
									<FieldLabel htmlFor="enroll-dob">Date of birth *</FieldLabel>
									<Input
										id="enroll-dob"
										type="date"
										max={new Date().toISOString().slice(0, 10)}
										value={form.dateOfBirth}
										onChange={(e) => update("dateOfBirth", e.target.value)}
										aria-invalid={!!fieldErrors.dateOfBirth}
									/>
									{fieldErrors.dateOfBirth ? (
										<FieldError>{fieldErrors.dateOfBirth}</FieldError>
									) : (
										<FieldDescription>
											{age !== null ? `Age: ${age}` : "Auto-calculated"}
										</FieldDescription>
									)}
								</Field>
								<Field>
									<FieldLabel>Gender *</FieldLabel>
									<Select
										value={form.gender}
										onValueChange={(value) => {
											if (value === null) return;
											update("gender", value);
										}}
									>
										<SelectTrigger aria-invalid={!!fieldErrors.gender}>
											<SelectValue placeholder="Select…" />
										</SelectTrigger>
										<SelectContent>
											{GENDERS.map((gender) => (
												<SelectItem key={gender} value={gender}>
													{GENDER_LABELS[gender]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{fieldErrors.gender ? (
										<FieldError>{fieldErrors.gender}</FieldError>
									) : null}
								</Field>
								<Field>
									<FieldLabel htmlFor="enroll-nationality">
										Nationality *
									</FieldLabel>
									<Input
										id="enroll-nationality"
										value={form.nationality}
										onChange={(e) => update("nationality", e.target.value)}
										aria-invalid={!!fieldErrors.nationality}
									/>
									{fieldErrors.nationality ? (
										<FieldError>{fieldErrors.nationality}</FieldError>
									) : null}
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor="enroll-nid">
									NID / Birth certificate no. (optional)
								</FieldLabel>
								<Input
									id="enroll-nid"
									value={form.nidOrBirthCertNo}
									onChange={(e) => update("nidOrBirthCertNo", e.target.value)}
								/>
							</Field>
						</CardContent>
					</Card>

					{/* Contact information */}
					<Card>
						<CardHeader>
							<CardTitle>Contact Information</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="grid gap-5 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor="enroll-phone">
										Mobile number *
									</FieldLabel>
									<Input
										id="enroll-phone"
										value={form.phone}
										placeholder="+880 1XXX-XXXXXX"
										onChange={(e) => update("phone", e.target.value)}
										autoComplete="tel"
										aria-invalid={!!fieldErrors.phone}
									/>
									{fieldErrors.phone ? (
										<FieldError>{fieldErrors.phone}</FieldError>
									) : null}
								</Field>
								<Field>
									<FieldLabel htmlFor="enroll-whatsapp">
										WhatsApp / alternate contact (optional)
									</FieldLabel>
									<Input
										id="enroll-whatsapp"
										value={form.whatsapp}
										onChange={(e) => update("whatsapp", e.target.value)}
									/>
								</Field>
							</div>

							<Field>
								<FieldLabel htmlFor="enroll-present">
									Present address *
								</FieldLabel>
								<Textarea
									id="enroll-present"
									rows={2}
									value={form.presentAddress}
									onChange={(e) => update("presentAddress", e.target.value)}
									aria-invalid={!!fieldErrors.presentAddress}
								/>
								{fieldErrors.presentAddress ? (
									<FieldError>{fieldErrors.presentAddress}</FieldError>
								) : null}
							</Field>

							<Field>
								<FieldLabel htmlFor="enroll-permanent">
									Permanent address *
								</FieldLabel>
								<Textarea
									id="enroll-permanent"
									rows={2}
									value={form.permanentAddress}
									onChange={(e) => update("permanentAddress", e.target.value)}
									aria-invalid={!!fieldErrors.permanentAddress}
								/>
								{fieldErrors.permanentAddress ? (
									<FieldError>{fieldErrors.permanentAddress}</FieldError>
								) : null}
							</Field>
						</CardContent>
					</Card>

					{/* Emergency contact */}
					<Card>
						<CardHeader>
							<CardTitle>Emergency Contact</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="grid gap-5 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor="enroll-emergency-name">
										Name *
									</FieldLabel>
									<Input
										id="enroll-emergency-name"
										value={form.emergencyName}
										onChange={(e) => update("emergencyName", e.target.value)}
										aria-invalid={!!fieldErrors.emergencyName}
									/>
									{fieldErrors.emergencyName ? (
										<FieldError>{fieldErrors.emergencyName}</FieldError>
									) : null}
								</Field>
								<Field>
									<FieldLabel htmlFor="enroll-emergency-relation">
										Relation *
									</FieldLabel>
									<Input
										id="enroll-emergency-relation"
										value={form.emergencyRelation}
										onChange={(e) =>
											update("emergencyRelation", e.target.value)
										}
										aria-invalid={!!fieldErrors.emergencyRelation}
									/>
									{fieldErrors.emergencyRelation ? (
										<FieldError>{fieldErrors.emergencyRelation}</FieldError>
									) : null}
								</Field>
							</div>

							<div className="grid gap-5 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor="enroll-emergency-mobile">
										Mobile number *
									</FieldLabel>
									<Input
										id="enroll-emergency-mobile"
										value={form.emergencyMobile}
										placeholder="+880 1XXX-XXXXXX"
										onChange={(e) => update("emergencyMobile", e.target.value)}
										aria-invalid={!!fieldErrors.emergencyMobile}
									/>
									{fieldErrors.emergencyMobile ? (
										<FieldError>{fieldErrors.emergencyMobile}</FieldError>
									) : null}
								</Field>
								<Field>
									<FieldLabel htmlFor="enroll-emergency-address">
										Address *
									</FieldLabel>
									<Input
										id="enroll-emergency-address"
										value={form.emergencyAddress}
										onChange={(e) => update("emergencyAddress", e.target.value)}
										aria-invalid={!!fieldErrors.emergencyAddress}
									/>
									{fieldErrors.emergencyAddress ? (
										<FieldError>{fieldErrors.emergencyAddress}</FieldError>
									) : null}
								</Field>
							</div>
						</CardContent>
					</Card>

					{/* Education & experience */}
					<Card>
						<CardHeader>
							<CardTitle>Education & Previous Experience</CardTitle>
						</CardHeader>
						<CardContent className="space-y-5">
							<Field>
								<FieldLabel htmlFor="enroll-education">
									Educational qualification *
								</FieldLabel>
								<Input
									id="enroll-education"
									value={form.education}
									onChange={(e) => update("education", e.target.value)}
									aria-invalid={!!fieldErrors.education}
								/>
								{fieldErrors.education ? (
									<FieldError>{fieldErrors.education}</FieldError>
								) : null}
							</Field>

							<Field>
								<FieldLabel>Previous barbering experience *</FieldLabel>
								<RadioRow
									name="barber-experience"
									value={form.hasBarberExperience}
									onChange={(value) => {
										update("hasBarberExperience", value);
										if (value === "no") {
											update("barberExperiencePeriod", "");
										}
									}}
									options={[
										{ value: "no", label: "No" },
										{ value: "yes", label: "Yes" },
									]}
								/>
								{form.hasBarberExperience === "yes" ? (
									<Input
										placeholder="Duration (e.g. 2 years at a salon)"
										value={form.barberExperiencePeriod}
										onChange={(e) =>
											update("barberExperiencePeriod", e.target.value)
										}
										aria-invalid={!!fieldErrors.barberExperiencePeriod}
									/>
								) : null}
								{fieldErrors.hasBarberExperience ? (
									<FieldError>{fieldErrors.hasBarberExperience}</FieldError>
								) : null}
								{fieldErrors.barberExperiencePeriod ? (
									<FieldError>{fieldErrors.barberExperiencePeriod}</FieldError>
								) : null}
							</Field>

							<Field>
								<FieldLabel>Previous training elsewhere? *</FieldLabel>
								<RadioRow
									name="prior-training"
									value={form.hasPriorTraining}
									onChange={(value) => {
										update("hasPriorTraining", value);
										if (value === "no") {
											update("priorTrainingInstitute", "");
										}
									}}
									options={[
										{ value: "no", label: "No" },
										{ value: "yes", label: "Yes" },
									]}
								/>
								{form.hasPriorTraining === "yes" ? (
									<Input
										placeholder="Institution name"
										value={form.priorTrainingInstitute}
										onChange={(e) =>
											update("priorTrainingInstitute", e.target.value)
										}
										aria-invalid={!!fieldErrors.priorTrainingInstitute}
									/>
								) : null}
								{fieldErrors.hasPriorTraining ? (
									<FieldError>{fieldErrors.hasPriorTraining}</FieldError>
								) : null}
								{fieldErrors.priorTrainingInstitute ? (
									<FieldError>{fieldErrors.priorTrainingInstitute}</FieldError>
								) : null}
							</Field>

							<Field>
								<FieldLabel htmlFor="enroll-goal">Course goal *</FieldLabel>
								<Textarea
									id="enroll-goal"
									rows={3}
									value={form.courseGoal}
									onChange={(e) => update("courseGoal", e.target.value)}
									aria-invalid={!!fieldErrors.courseGoal}
								/>
								<FieldDescription>
									What do you want to do after completing the course?
								</FieldDescription>
								{fieldErrors.courseGoal ? (
									<FieldError>{fieldErrors.courseGoal}</FieldError>
								) : null}
							</Field>
						</CardContent>
					</Card>

					{/* Course selection summary */}
					<Card>
						<CardHeader>
							<CardTitle>Selected Course</CardTitle>
						</CardHeader>
						<CardContent>
							<dl className="space-y-3">
								<div className="flex items-center justify-between">
									<dt className="text-sm text-muted-foreground">Course</dt>
									<dd className="text-sm font-medium">
										{selectedIntake?.programTitle ||
											programs.find(
												([slug]) => slug === form.programSlug,
											)?.[1] ||
											"—"}
									</dd>
								</div>
								<div className="flex items-center justify-between">
									<dt className="text-sm text-muted-foreground">Course fee</dt>
									<dd className="text-sm font-medium tabular-nums">
										{form.programSlug
											? formatFeePoisha(
													selectedIntake?.feePoisha ?? programFeePoisha ?? 0,
												)
											: "—"}
									</dd>
								</div>
								<div className="flex items-center justify-between">
									<dt className="text-sm text-muted-foreground">
										Admission / registration fee
									</dt>
									<dd className="text-sm">Included in course fee</dd>
								</div>
								<div className="flex items-center justify-between border-t border-border pt-3">
									<dt className="font-semibold">Total payable</dt>
									<dd className="text-lg font-semibold tabular-nums">
										{form.programSlug
											? formatFeePoisha(
													selectedIntake?.feePoisha ?? programFeePoisha ?? 0,
												)
											: "—"}
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>

					{/* Declaration */}
					<Card>
						<CardHeader>
							<CardTitle>Student Declaration</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
								{DECLARATION}
							</p>
							<div className="flex items-start gap-3">
								<Checkbox
									id="declaration"
									checked={form.declarationAccepted}
									onCheckedChange={(checked) =>
										update("declarationAccepted", checked === true)
									}
								/>
								<Label
									htmlFor="declaration"
									className="cursor-pointer text-sm leading-relaxed"
								>
									I have read and accept the student declaration above. *
								</Label>
							</div>
							{fieldErrors.declarationAccepted ? (
								<FieldError>{fieldErrors.declarationAccepted}</FieldError>
							) : null}
						</CardContent>
					</Card>

					{error ? (
						<div
							role="alert"
							className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
						>
							{error}
						</div>
					) : null}

					{showConfirm ? (
						<Card className="border-primary/40 bg-primary/5">
							<CardHeader>
								<CardTitle>Confirm your application</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<dl className="space-y-2 text-sm">
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Applicant</dt>
										<dd className="font-medium">{form.fullName}</dd>
									</div>
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Course</dt>
										<dd className="font-medium">
											{programs.find(
												([slug]) => slug === form.programSlug,
											)?.[1] ?? form.programSlug}
										</dd>
									</div>
									{selectedIntake ? (
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Batch</dt>
											<dd className="font-medium">
												{COHORT_LABELS[selectedIntake.cohort]} · starts{" "}
												{formatStartsOn(selectedIntake.startsOn)}
											</dd>
										</div>
									) : null}
									<div className="flex justify-between">
										<dt className="text-muted-foreground">Mobile</dt>
										<dd className="font-medium">{form.phone}</dd>
									</div>
								</dl>
								<div className="flex flex-col gap-2 sm:flex-row">
									<Button
										type="button"
										variant="outline"
										onClick={() => setShowConfirm(false)}
										disabled={submitting}
										className="sm:flex-1"
									>
										Go back
									</Button>
									<Button
										type="button"
										onClick={() => void onConfirm()}
										disabled={submitting}
										className="gap-2 sm:flex-1"
									>
										{submitting ? "Submitting…" : "Confirm & submit"}
										{!submitting ? (
											<IconArrowRight className="h-4 w-4" />
										) : null}
									</Button>
								</div>
							</CardContent>
						</Card>
					) : (
						<Button
							type="submit"
							size="lg"
							disabled={submitting}
							className="w-full gap-2"
						>
							{submitting ? "Submitting…" : "Submit application"}
							{!submitting ? <IconArrowRight className="h-4 w-4" /> : null}
						</Button>
					)}
				</form>
			</section>
		</main>
	);
}

function RadioRow({
	name,
	value,
	onChange,
	options,
}: {
	name: string;
	value: string;
	onChange: (value: "" | "yes" | "no") => void;
	options: Array<{ value: "yes" | "no"; label: string }>;
}) {
	return (
		<div className="flex flex-wrap gap-4">
			{options.map((option) => (
				<label
					key={option.value}
					className={cn(
						"flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors",
						value === option.value
							? "border-primary bg-primary/5"
							: "border-border hover:bg-muted/40",
					)}
				>
					<input
						type="radio"
						name={name}
						value={option.value}
						checked={value === option.value}
						onChange={() => onChange(option.value)}
						className="accent-primary"
					/>
					{option.label}
				</label>
			))}
		</div>
	);
}

function ConfirmationPanel({
	reference,
	email,
	programTitle,
	cohortLabel,
	startsOn,
}: {
	reference: string;
	email: string;
	programTitle?: string;
	cohortLabel?: string;
	startsOn?: string;
}) {
	return (
		<main className="bg-background px-6 py-24">
			<div className="mx-auto max-w-xl text-center">
				<IconCircleCheck
					className="mx-auto h-14 w-14 text-primary"
					stroke={1.5}
				/>
				<h1 className="mt-6 font-heading text-3xl font-medium sm:text-4xl">
					Application received
				</h1>
				<p className="mt-4 text-muted-foreground">
					Thanks for applying — our admissions team reviews applications within
					2–3 working days and will contact you about next steps.
				</p>
				<Card className="mt-8 border-primary/40 bg-primary/5 text-center">
					<CardContent className="space-y-2 py-6">
						<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
							Your reference
						</p>
						<p className="font-heading text-3xl font-semibold tracking-wide text-primary">
							{reference}
						</p>
						{programTitle ? (
							<p className="text-sm text-muted-foreground">
								{programTitle}
								{cohortLabel ? ` · ${cohortLabel}` : ""}
								{startsOn ? ` · starts ${startsOn}` : ""}
							</p>
						) : null}
						<p className="text-xs text-muted-foreground">
							A confirmation email is on its way to {email}. Track your
							application anytime from your dashboard.
						</p>
					</CardContent>
				</Card>
				<Link to="/dashboard" className={cn(buttonVariants(), "mt-8 gap-2")}>
					Go to dashboard
					<IconArrowRight className="h-4 w-4" />
				</Link>
			</div>
		</main>
	);
}
