import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
	type PaginatedPosts,
	POST_CATEGORY_VALUES,
	type PostCategory,
	type PostDetail,
	type PostSummary,
} from '@/components/pages/blog/types';
import { db } from '@/lib/db';
import { renderMarkdown } from '@/server/markdown';
import type { Prisma } from '../../prisma/generated/prisma/client';

export const POSTS_PER_PAGE = 9;

const SUMMARY_SELECT = {
	id: true,
	slug: true,
	title: true,
	excerpt: true,
	coverImage: true,
	coverImageAlt: true,
	category: true,
	tags: true,
	featured: true,
	readingMinutes: true,
	publishedAt: true,
} satisfies Prisma.PostSelect;

type SummaryRow = Prisma.PostGetPayload<{ select: typeof SUMMARY_SELECT }>;

function toSummary(row: SummaryRow): PostSummary {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		excerpt: row.excerpt,
		coverImage: row.coverImage,
		coverImageAlt: row.coverImageAlt,
		category: row.category as PostCategory,
		tags: row.tags,
		featured: row.featured,
		readingMinutes: row.readingMinutes,
		publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
	};
}

const listSchema = z.object({
	page: z.number().int().min(1).max(500).optional(),
	category: z.enum(POST_CATEGORY_VALUES).optional(),
});

export const getPublishedPosts = createServerFn({ method: 'GET' })
	.validator((input: unknown) => listSchema.parse(input))
	.handler(async ({ data }): Promise<PaginatedPosts> => {
		const page = data.page ?? 1;
		const where: Prisma.PostWhereInput = {
			status: 'published',
			...(data.category ? { category: data.category } : {}),
		};

		const [total, rows] = await Promise.all([
			db.post.count({ where }),
			db.post.findMany({
				where,
				orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
				skip: (page - 1) * POSTS_PER_PAGE,
				take: POSTS_PER_PAGE,
				select: SUMMARY_SELECT,
			}),
		]);

		return {
			items: rows.map(toSummary),
			total,
			page,
			perPage: POSTS_PER_PAGE,
			totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
		};
	});

/** Category chips for the index, only counting posts visitors can read. */
export const getPostCategoryCounts = createServerFn({ method: 'GET' }).handler(
	async (): Promise<{ category: PostCategory; count: number }[]> => {
		const rows = await db.post.groupBy({
			by: ['category'],
			where: { status: 'published' },
			_count: { _all: true },
		});

		return rows.map((row) => ({
			category: row.category as PostCategory,
			count: row._count._all,
		}));
	},
);

const slugSchema = z.object({ slug: z.string().trim().min(1) });

export const getPublishedPostBySlug = createServerFn({ method: 'GET' })
	.validator((input: unknown) => slugSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<{ post: PostDetail; related: PostSummary[] } | null> => {
			const row = await db.post.findFirst({
				where: { slug: data.slug, status: 'published' },
			});

			if (!row) {
				return null;
			}

			const relatedRows = await db.post.findMany({
				where: {
					status: 'published',
					slug: { not: row.slug },
					...(row.tags.length ? { tags: { hasSome: row.tags } } : {}),
				},
				orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
				take: 3,
				select: SUMMARY_SELECT,
			});

			const summary = toSummary(row);

			return {
				post: {
					...summary,
					bodyHtml: renderMarkdown(row.body),
					authorName: row.authorName,
					updatedAt: row.updatedAt.toISOString(),
				},
				related: relatedRows.map(toSummary),
			};
		},
	);
