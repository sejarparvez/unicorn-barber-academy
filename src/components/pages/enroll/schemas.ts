import { z } from 'zod';

export const GENDERS = ['Male', 'Female', 'Other'] as const;

const required = (label: string, max = 120) =>
	z
		.string()
		.trim()
		.min(1, `${label} is required.`)
		.max(max, `${label} must be ${max} characters or fewer.`);

const optional = (max: number) =>
	z.string().trim().max(max, `Please use ${max} characters or fewer.`);

export const admissionFormSchema = z
	.object({
		// 1. Student information
		fullName: required('Full name'),
		fatherName: required("Father's name"),
		motherName: required("Mother's name"),
		dateOfBirth: z
			.string()
			.trim()
			.min(1, 'Date of birth is required.')
			.refine(
				(value) => !Number.isNaN(Date.parse(value)),
				'Please enter a valid date of birth.',
			)
			.refine(
				(value) => Date.parse(value) <= Date.now(),
				'Date of birth cannot be in the future.',
			),
		nationality: required('Nationality', 60),
		gender: z.enum(GENDERS, { message: 'Please choose a gender.' }),
		nidNumber: required('NID / birth certificate number', 40),

		// 2. Contact information
		phone: z
			.string()
			.trim()
			.min(7, 'Please enter a mobile number we can reach you on.')
			.max(24, 'Mobile number must be 24 characters or fewer.'),
		whatsapp: optional(120),
		presentAddress: required('Present address', 300),
		permanentAddress: required('Permanent address', 300),

		// 3. Emergency contact
		emergencyName: required('Emergency contact name'),
		emergencyRelation: required('Relationship', 60),
		emergencyMobile: z
			.string()
			.trim()
			.min(7, 'Please enter an emergency mobile number.')
			.max(24, 'Mobile number must be 24 characters or fewer.'),
		emergencyAddress: optional(300),

		// 4. Education & previous experience
		education: required('Education', 200),
		hasBarberingExperience: z.boolean(),
		barberingExperienceDuration: optional(200),
		hasPreviousTraining: z.boolean(),
		previousTrainingInstitution: optional(200),
		goal: z
			.string()
			.trim()
			.min(1, 'Please tell us your goal for this course.')
			.max(1000, 'Goal must be 1,000 characters or fewer.'),
	})
	.superRefine((value, ctx) => {
		if (
			value.hasBarberingExperience &&
			!value.barberingExperienceDuration?.trim()
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['barberingExperienceDuration'],
				message: 'Please describe your experience and how long.',
			});
		}

		if (
			value.hasPreviousTraining &&
			!value.previousTrainingInstitution?.trim()
		) {
			ctx.addIssue({
				code: 'custom',
				path: ['previousTrainingInstitution'],
				message: 'Please tell us where you trained.',
			});
		}
	});

export type AdmissionFormValues = z.infer<typeof admissionFormSchema>;
