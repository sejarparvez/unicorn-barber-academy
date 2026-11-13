import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import {
	type ProgramFormValues,
	programSchema,
} from '@/components/pages/dashboard/programs/schemas';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';

const MODULE_ORDER = { position: 'asc' } as const;

export type AdminProgramSummary = {
	id: string;
	slug: string;
	title: string;
	category: string;
	price: number;
	position: number;
	featured: boolean;
	hidden: boolean;
	moduleCount: number;
};

export type AdminProgramDetail = ProgramFormValues & { id: string };

const idSchema = z.object({ id: z.string().trim().min(1) });

const updateSchema = programSchema.extend({ id: z.string().trim().min(1) });

const hiddenSchema = z.object({
	id: z.string().trim().min(1),
	hidden: z.boolean(),
});

async function assertSlugAvailable(slug: string, ignoreId?: string) {
	const existing = await db.program.findUnique({
		where: { slug },
		select: { id: true },
	});

	if (existing && existing.id !== ignoreId) {
		throw new Error('Another program already uses this slug.');
	}
}

export const getAdminPrograms = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminProgramSummary[]> => {
		await ensureAdmin();

		const rows = await db.program.findMany({
			orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
			select: {
				id: true,
				slug: true,
				title: true,
				category: true,
				price: true,
				position: true,
				featured: true,
				hidden: true,
				_count: { select: { modules: true } },
			},
		});

		return rows.map((row) => ({
			id: row.id,
			slug: row.slug,
			title: row.title,
			category: row.category,
			price: row.price,
			position: row.position,
			featured: row.featured,
			hidden: row.hidden,
			moduleCount: row._count.modules,
		}));
	},
);

export const getAdminProgram = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<AdminProgramDetail | null> => {
		await ensureAdmin();

		const row = await db.program.findUnique({
			where: { id: data.id },
			include: { modules: { orderBy: MODULE_ORDER } },
		});

		if (!row) {
			return null;
		}

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			category: row.category as ProgramFormValues['category'],
			level: row.level,
			duration: row.duration,
			tagline: row.tagline,
			description: row.description,
			highlights: row.highlights,
			outcome: row.outcome,
			whoFor: row.whoFor,
			careerPaths: row.careerPaths,
			curriculum: row.modules.map((module) => ({
				title: module.title,
				description: module.description,
			})),
			price: row.price,
			position: row.position,
			featured: row.featured,
			hidden: row.hidden,
		};
	});

export const createProgram = createServerFn({ method: 'POST' })
	.validator((input: unknown) => programSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();
		await assertSlugAvailable(data.slug);

		const { curriculum, ...rest } = data;

		const program = await db.program.create({
			data: {
				...rest,
				modules: {
					create: curriculum.map((module, index) => ({
						...module,
						position: index + 1,
					})),
				},
			},
			select: { id: true },
		});

		return { id: program.id };
	});

export const updateProgram = createServerFn({ method: 'POST' })
	.validator((input: unknown) => updateSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();
		await assertSlugAvailable(data.slug, data.id);

		const { id, curriculum, ...rest } = data;

		const program = await db.program.update({
			where: { id },
			data: {
				...rest,
				modules: {
					deleteMany: {},
					create: curriculum.map((module, index) => ({
						...module,
						position: index + 1,
					})),
				},
			},
			select: { id: true },
		});

		return { id: program.id };
	});

export const setProgramHidden = createServerFn({ method: 'POST' })
	.validator((input: unknown) => hiddenSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; hidden: boolean }> => {
		await ensureAdmin();

		const program = await db.program.update({
			where: { id: data.id },
			data: { hidden: data.hidden },
			select: { id: true, hidden: true },
		});

		return program;
	});

export const deleteProgram = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		const program = await db.program.delete({
			where: { id: data.id },
			select: { id: true },
		});

		return program;
	});
