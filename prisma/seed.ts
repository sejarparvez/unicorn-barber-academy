import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from './generated/prisma/client';
import { SEED_PROGRAMS } from './seed-data';

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

		await db.program.upsert({
			where: { slug: program.slug },
			create: {
				...rest,
				featured: featured ?? false,
				position: index + 1,
				modules: { create: modules },
			},
			update: {
				...rest,
				featured: featured ?? false,
				position: index + 1,
				modules: {
					deleteMany: {},
					create: modules,
				},
			},
		});
	}

	console.log(`Seeded ${SEED_PROGRAMS.length} programs.`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await db.$disconnect();
	});
