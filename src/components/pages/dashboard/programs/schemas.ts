import { z } from 'zod';

export const PROGRAM_CATEGORIES = [
	'Barbering',
	'Beauty & styling',
	'Makeup',
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * The admin form keeps list fields as `string[]`. Each entry is trimmed and
 * blank lines are dropped before the minimum-length check runs, so an empty
 * textarea reports a single clear error.
 */
const stringList = z
	.array(z.string())
	.transform((items) => items.map((item) => item.trim()).filter(Boolean))
	.pipe(z.array(z.string().min(1)).min(1, 'Add at least one entry.'));

const moduleSchema = z.object({
	title: z
		.string()
		.trim()
		.min(2, 'Module title is required.')
		.max(120, 'Module title must be 120 characters or fewer.'),
	description: z
		.string()
		.trim()
		.min(2, 'Module description is required.')
		.max(400, 'Module description must be 400 characters or fewer.'),
});

export const programSchema = z.object({
	title: z
		.string()
		.trim()
		.min(2, 'Please enter a program title.')
		.max(120, 'Title must be 120 characters or fewer.'),
	slug: z
		.string()
		.trim()
		.min(2, 'Please enter a URL slug.')
		.max(120, 'Slug must be 120 characters or fewer.')
		.regex(
			SLUG_PATTERN,
			'Use lowercase letters, numbers and single hyphens only.',
		),
	category: z.enum(PROGRAM_CATEGORIES, { message: 'Choose a category.' }),
	level: z
		.string()
		.trim()
		.min(2, 'Please describe the level.')
		.max(80, 'Level must be 80 characters or fewer.'),
	duration: z
		.string()
		.trim()
		.min(2, 'Please enter a duration.')
		.max(80, 'Duration must be 80 characters or fewer.'),
	tagline: z
		.string()
		.trim()
		.min(2, 'Please enter a short tagline.')
		.max(160, 'Tagline must be 160 characters or fewer.'),
	description: z
		.string()
		.trim()
		.min(10, 'Description must be at least 10 characters.')
		.max(1200, 'Description must be 1,200 characters or fewer.'),
	highlights: stringList,
	outcome: z
		.string()
		.trim()
		.min(2, 'Please describe the outcome.')
		.max(600, 'Outcome must be 600 characters or fewer.'),
	whoFor: stringList,
	careerPaths: stringList,
	curriculum: z.array(moduleSchema).min(1, 'Add at least one module.'),
	price: z
		.number()
		.int('Price must be a whole number.')
		.min(0, 'Price cannot be negative.')
		.max(10_000_000, 'Price looks too high.'),
	position: z
		.number()
		.int('Position must be a whole number.')
		.min(1, 'Position must be at least 1.')
		.max(999, 'Position must be 999 or lower.'),
	featured: z.boolean(),
	hidden: z.boolean(),
});

export type ProgramFormValues = z.infer<typeof programSchema>;
export type ProgramModuleValues = z.infer<typeof moduleSchema>;
