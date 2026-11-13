import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import type {
	Program,
	ProgramCategory,
	ProgramOption,
} from '@/components/pages/programs/types';
import { db } from '@/lib/db';
import type { Prisma } from '../../prisma/generated/prisma/client';

const PROGRAM_INCLUDE = {
	modules: { orderBy: { position: 'asc' } },
} satisfies Prisma.ProgramInclude;

type ProgramRow = Prisma.ProgramGetPayload<{ include: typeof PROGRAM_INCLUDE }>;

function toProgram(row: ProgramRow): Program {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		category: row.category as ProgramCategory,
		level: row.level,
		duration: row.duration,
		schedule: row.schedule,
		tagline: row.tagline,
		description: row.description,
		highlights: row.highlights,
		outcome: row.outcome,
		curriculum: row.modules.map((module) => ({
			title: module.title,
			description: module.description,
		})),
		whoFor: row.whoFor,
		careerPaths: row.careerPaths,
		price: row.price,
		position: row.position,
		featured: row.featured,
	};
}

export const getPrograms = createServerFn({ method: 'GET' }).handler(
	async (): Promise<Program[]> => {
		const rows = await db.program.findMany({
			where: { hidden: false },
			include: PROGRAM_INCLUDE,
			orderBy: { position: 'asc' },
		});

		return rows.map(toProgram);
	},
);

export const getProgramOptions = createServerFn({ method: 'GET' }).handler(
	async (): Promise<ProgramOption[]> =>
		db.program.findMany({
			where: { hidden: false },
			select: { slug: true, title: true },
			orderBy: { position: 'asc' },
		}),
);

const slugSchema = z.object({
	slug: z.string().trim().min(1),
});

export const getProgramBySlug = createServerFn({ method: 'GET' })
	.validator((input: unknown) => slugSchema.parse(input))
	.handler(async ({ data }): Promise<Program | null> => {
		const row = await db.program.findFirst({
			where: { slug: data.slug, hidden: false },
			include: PROGRAM_INCLUDE,
		});

		return row ? toProgram(row) : null;
	});

const relatedSchema = z.object({
	slug: z.string().trim().min(1),
	limit: z.number().int().min(1).max(6).optional(),
});

export const getRelatedPrograms = createServerFn({ method: 'GET' })
	.validator((input: unknown) => relatedSchema.parse(input))
	.handler(async ({ data }): Promise<Program[]> => {
		const limit = data.limit ?? 3;
		const current = await db.program.findFirst({
			where: { slug: data.slug, hidden: false },
			select: { category: true },
		});

		if (!current) {
			return [];
		}

		const sameCategory = await db.program.findMany({
			where: {
				slug: { not: data.slug },
				category: current.category,
				hidden: false,
			},
			orderBy: { position: 'asc' },
			take: limit,
			include: PROGRAM_INCLUDE,
		});

		if (sameCategory.length >= limit) {
			return sameCategory.map(toProgram);
		}

		const otherCategories = await db.program.findMany({
			where: {
				slug: { not: data.slug },
				category: { not: current.category },
				hidden: false,
			},
			orderBy: { position: 'asc' },
			take: limit - sameCategory.length,
			include: PROGRAM_INCLUDE,
		});

		return [...sameCategory, ...otherCategories].map(toProgram);
	});
