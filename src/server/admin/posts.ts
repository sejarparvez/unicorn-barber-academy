import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
	deriveExcerpt,
	estimateReadingMinutes,
	type PostCategory,
	type PostStatus,
} from '@/components/pages/blog/types';
import {
	type PostFormValues,
	postSchema,
} from '@/components/pages/dashboard/blog/schemas';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export type AdminPostSummary = {
	id: string;
	slug: string;
	title: string;
	category: PostCategory;
	status: PostStatus;
	featured: boolean;
	tags: string[];
	readingMinutes: number;
	publishedAt: string | null;
	updatedAt: string;
};

export type AdminPostDetail = PostFormValues & { id: string };

const idSchema = z.object({ id: z.string().trim().min(1) });
const updateSchema = postSchema.extend({ id: z.string().trim().min(1) });
const statusSchema = z.object({
	id: z.string().trim().min(1),
	status: z.enum(['draft', 'published']),
});
const featuredSchema = z.object({
	id: z.string().trim().min(1),
	featured: z.boolean(),
});

async function assertSlugAvailable(slug: string, ignoreId?: string) {
	const existing = await db.post.findUnique({
		where: { slug },
		select: { id: true },
	});

	if (existing && existing.id !== ignoreId) {
		throw new Error('Another post already uses this slug.');
	}
}

/**
 * Normalises a form submission into database values. `publishedAt` is stamped
 * the first time a post is published and kept stable on later edits so
 * ordering never jumps.
 */
function toData(data: PostFormValues, publishedAt: Date | null) {
	return {
		title: data.title,
		slug: data.slug,
		excerpt: data.excerpt || deriveExcerpt(data.body),
		body: data.body,
		category: data.category,
		tags: data.tags,
		coverImage: data.coverImage || null,
		coverImageAlt: data.coverImageAlt || null,
		status: data.status,
		featured: data.featured,
		authorName: data.authorName,
		readingMinutes: estimateReadingMinutes(data.body),
		publishedAt,
	};
}

export const getAdminPosts = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminPostSummary[]> => {
		await ensureAdmin();

		const rows = await db.post.findMany({
			orderBy: [{ updatedAt: 'desc' }],
			select: {
				id: true,
				slug: true,
				title: true,
				category: true,
				status: true,
				featured: true,
				tags: true,
				readingMinutes: true,
				publishedAt: true,
				updatedAt: true,
			},
		});

		return rows.map((row) => ({
			id: row.id,
			slug: row.slug,
			title: row.title,
			category: row.category as PostCategory,
			status: row.status as PostStatus,
			featured: row.featured,
			tags: row.tags,
			readingMinutes: row.readingMinutes,
			publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
			updatedAt: row.updatedAt.toISOString(),
		}));
	},
);

export const getAdminPost = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<AdminPostDetail | null> => {
		await ensureAdmin();

		const row = await db.post.findUnique({ where: { id: data.id } });

		if (!row) {
			return null;
		}

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt ?? '',
			body: row.body,
			category: row.category as PostCategory,
			tags: row.tags,
			coverImage: row.coverImage ?? '',
			coverImageAlt: row.coverImageAlt ?? '',
			status: row.status as PostStatus,
			featured: row.featured,
			authorName: row.authorName,
		};
	});

export const createPost = createServerFn({ method: 'POST' })
	.validator((input: unknown) => postSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();
		await assertSlugAvailable(data.slug);

		const post = await db.post.create({
			data: toData(data, data.status === 'published' ? new Date() : null),
			select: { id: true },
		});

		return { id: post.id };
	});

export const updatePost = createServerFn({ method: 'POST' })
	.validator((input: unknown) => updateSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();
		await assertSlugAvailable(data.slug, data.id);

		const existing = await db.post.findUnique({
			where: { id: data.id },
			select: { publishedAt: true },
		});

		if (!existing) {
			throw new Error('That post no longer exists.');
		}

		const publishedAt =
			existing.publishedAt ?? (data.status === 'published' ? new Date() : null);

		const post = await db.post.update({
			where: { id: data.id },
			data: toData(data, publishedAt),
			select: { id: true },
		});

		return { id: post.id };
	});

export const setPostStatus = createServerFn({ method: 'POST' })
	.validator((input: unknown) => statusSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; status: PostStatus }> => {
		await ensureAdmin();

		const existing = await db.post.findUnique({
			where: { id: data.id },
			select: { publishedAt: true },
		});

		if (!existing) {
			throw new Error('That post no longer exists.');
		}

		const post = await db.post.update({
			where: { id: data.id },
			data: {
				status: data.status,
				publishedAt:
					existing.publishedAt ??
					(data.status === 'published' ? new Date() : null),
			},
			select: { id: true, status: true },
		});

		return { id: post.id, status: post.status as PostStatus };
	});

export const setPostFeatured = createServerFn({ method: 'POST' })
	.validator((input: unknown) => featuredSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; featured: boolean }> => {
		await ensureAdmin();

		const post = await db.post.update({
			where: { id: data.id },
			data: { featured: data.featured },
			select: { id: true, featured: true },
		});

		return { id: post.id, featured: post.featured };
	});

export const deletePost = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		return db.post.delete({ where: { id: data.id }, select: { id: true } });
	});
