import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';
import { SEED_BATCHES, SEED_PROGRAMS } from './seed-data';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is not set.');
}

const db = new PrismaClient({
	adapter: new PrismaNeon({ connectionString }),
});

async function main() {
	for (const [index, program] of SEED_PROGRAMS.entries()) {
		const { curriculum, featured, ...rest } = program;
		const modules = curriculum.map((module, moduleIndex) => ({
			...module,
			position: moduleIndex + 1,
		}));
		const batches = buildBatches();

		await db.program.upsert({
			where: { slug: program.slug },
			create: {
				...rest,
				featured: featured ?? false,
				position: index + 1,
				modules: { create: modules },
				batches: { create: batches },
			},
			update: {
				...rest,
				featured: featured ?? false,
				position: index + 1,
				modules: {
					deleteMany: {},
					create: modules,
				},
				batches: {
					deleteMany: {},
					create: batches,
				},
			},
		});
	}

	console.log(`Seeded ${SEED_PROGRAMS.length} programs.`);
}

function buildBatches() {
	const day = 24 * 60 * 60 * 1000;
	const now = Date.now();

	return SEED_BATCHES.map((batch) => {
		const startDate = new Date(now + batch.startInDays * day);
		const endDate = new Date(startDate.getTime() + batch.durationInDays * day);

		return {
			name: batch.name,
			schedule: batch.schedule,
			startDate,
			endDate,
			capacity: batch.capacity,
			status: 'upcoming' as const,
		};
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.$disconnect();
	});
