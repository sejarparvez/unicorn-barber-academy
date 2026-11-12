import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';

async function getAuthSession() {
	const headers = getRequestHeaders();
	return auth.api.getSession({ headers });
}

export const getSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		return getAuthSession();
	},
);

export const ensureSession = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await getAuthSession();

		if (!session) {
			throw new Error('Unauthorized');
		}

		return session;
	},
);

export const ensureAdmin = createServerFn({ method: 'GET' }).handler(
	async () => {
		const session = await getAuthSession();

		if (!session) {
			throw new Error('Unauthorized');
		}

		if (session.user.role !== 'admin') {
			throw new Error('Forbidden');
		}

		return session;
	},
);
