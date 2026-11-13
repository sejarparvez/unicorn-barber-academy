import { z } from 'zod';
import {
	POST_CATEGORY_VALUES,
	POST_STATUS_VALUES,
} from '@/components/pages/blog/types';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const POST_TAGS_MAX = 6;

/**
 * Tags are entered as one-per-line in a textarea. Blank lines are dropped and
 * the list may be empty, unlike the program list fields which require an entry.
 */
const tagList = z
	.array(z.string())
	.transform((items) => items.map((item) => item.trim()).filter(Boolean))
	.pipe(
		z
			.array(z.string().max(30, 'Tags must be 30 characters or fewer.'))
			.max(POST_TAGS_MAX, `Use at most ${POST_TAGS_MAX} tags.`),
	);

export const postSchema = z.object({
	title: z
		.string()
		.trim()
		.min(2, 'Please enter a title.')
		.max(140, 'Title must be 140 characters or fewer.'),
	slug: z
		.string()
		.trim()
		.min(2, 'Please enter a URL slug.')
		.max(160, 'Slug must be 160 characters or fewer.')
		.regex(
			SLUG_PATTERN,
			'Use lowercase letters, numbers and single hyphens only.',
		),
	excerpt: z
		.string()
		.trim()
		.max(300, 'Excerpt must be 300 characters or fewer.'),
	body: z.string().trim().min(1, 'Write the article body.'),
	category: z.enum(POST_CATEGORY_VALUES, { message: 'Choose a category.' }),
	tags: tagList,
	coverImage: z
		.string()
		.trim()
		.refine((value) => value === '' || /^https?:\/\//.test(value), {
			message: 'Cover image must be an uploaded image.',
		}),
	coverImageAlt: z
		.string()
		.trim()
		.max(160, 'Alt text must be 160 characters or fewer.'),
	status: z.enum(POST_STATUS_VALUES, { message: 'Choose a status.' }),
	featured: z.boolean(),
	authorName: z
		.string()
		.trim()
		.min(2, 'Please enter an author name.')
		.max(80, 'Author name must be 80 characters or fewer.'),
});

export type PostFormValues = z.infer<typeof postSchema>;
