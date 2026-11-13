import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth.functions';
import { db } from '@/lib/db';

export type AdminCertificate = {
	id: string;
	certificateNo: string;
	issuedAt: string;
	revokedAt: string | null;
	studentName: string;
	studentEmail: string;
	admissionNo: string | null;
	programTitle: string;
	batchName: string;
	issuedByName: string | null;
};

export type CertificateCandidate = {
	enrollmentId: string;
	studentName: string;
	studentEmail: string;
	admissionNo: string | null;
	programTitle: string;
	batchName: string;
	completedAt: string | null;
	balance: number;
};

export const getAdminCertificates = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AdminCertificate[]> => {
		await ensureAdmin();

		const rows = await db.certificate.findMany({
			orderBy: { issuedAt: 'desc' },
			include: {
				issuedBy: { select: { name: true } },
				enrollment: {
					select: {
						admissionNo: true,
						fullName: true,
						user: { select: { name: true, email: true } },
						batch: {
							select: { name: true, program: { select: { title: true } } },
						},
					},
				},
			},
		});

		return rows.map((row) => ({
			id: row.id,
			certificateNo: row.certificateNo,
			issuedAt: row.issuedAt.toISOString(),
			revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
			studentName: row.enrollment.fullName,
			studentEmail: row.enrollment.user.email,
			admissionNo: row.enrollment.admissionNo,
			programTitle: row.enrollment.batch.program.title,
			batchName: row.enrollment.batch.name,
			issuedByName: row.issuedBy?.name ?? null,
		}));
	},
);

/** Completed students who do not have a certificate yet. */
export const getCertificateCandidates = createServerFn({
	method: 'GET',
}).handler(async (): Promise<CertificateCandidate[]> => {
	await ensureAdmin();

	const rows = await db.enrollment.findMany({
		where: { status: 'completed', certificate: { is: null } },
		orderBy: [{ decidedAt: 'desc' }, { createdAt: 'desc' }],
		select: {
			id: true,
			admissionNo: true,
			decidedAt: true,
			fullName: true,
			user: { select: { name: true, email: true } },
			batch: {
				select: {
					name: true,
					program: { select: { title: true, price: true } },
				},
			},
			payments: { select: { amount: true } },
		},
	});

	return rows.map((row) => {
		const paid = row.payments.reduce((sum, payment) => sum + payment.amount, 0);

		return {
			enrollmentId: row.id,
			studentName: row.fullName,
			studentEmail: row.user.email,
			admissionNo: row.admissionNo,
			programTitle: row.batch.program.title,
			batchName: row.batch.name,
			completedAt: row.decidedAt ? row.decidedAt.toISOString() : null,
			balance: Math.max(row.batch.program.price - paid, 0),
		};
	});
});

/** Certificate numbers look like `UBTA-CERT-2026-0001`, unique per year. */
async function generateCertificateNo() {
	const year = new Date().getFullYear();
	const prefix = `UBTA-CERT-${year}-`;
	const last = await db.certificate.findFirst({
		where: { certificateNo: { startsWith: prefix } },
		orderBy: { certificateNo: 'desc' },
		select: { certificateNo: true },
	});

	const next = last?.certificateNo
		? Number.parseInt(last.certificateNo.slice(prefix.length), 10) + 1
		: 1;

	return `${prefix}${String(next).padStart(4, '0')}`;
}

const issueSchema = z.object({ enrollmentId: z.string().trim().min(1) });

export const issueCertificate = createServerFn({ method: 'POST' })
	.validator((input: unknown) => issueSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string; certificateNo: string }> => {
		const session = await ensureAdmin();

		const enrollment = await db.enrollment.findUnique({
			where: { id: data.enrollmentId },
			select: {
				id: true,
				status: true,
				certificate: { select: { id: true } },
			},
		});

		if (!enrollment) {
			throw new Error('That enrolment no longer exists.');
		}

		if (enrollment.status !== 'completed') {
			throw new Error(
				'Only students who have completed the program can receive a certificate.',
			);
		}

		if (enrollment.certificate) {
			throw new Error('This student already has a certificate.');
		}

		const certificateNo = await generateCertificateNo();

		const certificate = await db.certificate.create({
			data: {
				enrollmentId: enrollment.id,
				certificateNo,
				issuedById: session.user.id,
			},
			select: { id: true, certificateNo: true },
		});

		return certificate;
	});

const idSchema = z.object({ id: z.string().trim().min(1) });

const revokeSchema = z.object({
	id: z.string().trim().min(1),
	revoked: z.boolean(),
});

export const setCertificateRevoked = createServerFn({ method: 'POST' })
	.validator((input: unknown) => revokeSchema.parse(input))
	.handler(
		async ({ data }): Promise<{ id: string; revokedAt: string | null }> => {
			await ensureAdmin();

			const certificate = await db.certificate.update({
				where: { id: data.id },
				data: { revokedAt: data.revoked ? new Date() : null },
				select: { id: true, revokedAt: true },
			});

			return {
				id: certificate.id,
				revokedAt: certificate.revokedAt
					? certificate.revokedAt.toISOString()
					: null,
			};
		},
	);

export const deleteCertificate = createServerFn({ method: 'POST' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<{ id: string }> => {
		await ensureAdmin();

		return db.certificate.delete({
			where: { id: data.id },
			select: { id: true },
		});
	});
