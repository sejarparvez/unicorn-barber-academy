import { createServerFn } from '@tanstack/react-start';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export const getAccountSecurity = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await ensureSession();

		const accounts = await db.account.findMany({
			where: { userId: session.user.id },
			select: { providerId: true },
		});

		const providers = [
			...new Set(accounts.map((account) => account.providerId)),
		];

		return {
			providers,
			hasPassword: providers.includes('credential'),
		};
	},
);
