// The dev server may start without .env in its process env (e.g. it was
// launched before .env existed), so load it explicitly rather than relying
// on the launcher. No-op when real env vars are set (production deploys).
import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../../prisma/generated/prisma/client';

const adapter = new PrismaNeon({
	// biome-ignore lint/style/noNonNullAssertion: this is fine
	connectionString: process.env.DATABASE_URL!,
});

declare global {
	var __prisma: PrismaClient | undefined;
}

export const db = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
	globalThis.__prisma = db;
}
