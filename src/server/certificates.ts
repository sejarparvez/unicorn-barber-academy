import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import type { Prisma } from '../../prisma/generated/prisma/client';

export type StudentCertificate = {
	id: string;
	certificateNo: string;
	issuedAt: string;
	revokedAt: string | null;
	studentName: string;
	programTitle: string;
	batchName: string;
};

const CERTIFICATE_INCLUDE = {
	enrollment: {
		select: {
			userId: true,
			fullName: true,
			batch: {
				select: { name: true, program: { select: { title: true } } },
			},
		},
	},
} as const satisfies Prisma.CertificateInclude;

type CertificateRow = Prisma.CertificateGetPayload<{
	include: typeof CERTIFICATE_INCLUDE;
}>;

function toStudentCertificate(row: CertificateRow): StudentCertificate {
	return {
		id: row.id,
		certificateNo: row.certificateNo,
		issuedAt: row.issuedAt.toISOString(),
		revokedAt: row.revokedAt ? row.revokedAt.toISOString() : null,
		studentName: row.enrollment.fullName,
		programTitle: row.enrollment.batch.program.title,
		batchName: row.enrollment.batch.name,
	};
}

export const getMyCertificates = createServerFn({ method: 'GET' }).handler(
	async (): Promise<StudentCertificate[]> => {
		const session = await ensureSession();

		const rows = await db.certificate.findMany({
			where: { enrollment: { userId: session.user.id } },
			orderBy: { issuedAt: 'desc' },
			include: CERTIFICATE_INCLUDE,
		});

		return rows.map(toStudentCertificate);
	},
);

const idSchema = z.object({ id: z.string().trim().min(1) });

/** One certificate, visible to its owner (or any admin) for printing. */
export const getMyCertificate = createServerFn({ method: 'GET' })
	.validator((input: unknown) => idSchema.parse(input))
	.handler(async ({ data }): Promise<StudentCertificate | null> => {
		const session = await ensureSession();

		const row = await db.certificate.findUnique({
			where: { id: data.id },
			include: CERTIFICATE_INCLUDE,
		});

		if (!row) {
			return null;
		}

		const isOwner = row.enrollment.userId === session.user.id;
		const isAdmin = session.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return null;
		}

		return toStudentCertificate(row);
	});

export type CertificateVerification = {
	certificateNo: string;
	studentName: string;
	programTitle: string;
	issuedAt: string;
	revoked: boolean;
};

const verifySchema = z.object({
	certificateNo: z.string().trim().min(1).max(60),
});

/** Public lookup used by the /verify page. No authentication required. */
export const verifyCertificate = createServerFn({ method: 'GET' })
	.validator((input: unknown) => verifySchema.parse(input))
	.handler(async ({ data }): Promise<CertificateVerification | null> => {
		const certificateNo = data.certificateNo.toUpperCase();

		const row = await db.certificate.findUnique({
			where: { certificateNo },
			select: {
				certificateNo: true,
				issuedAt: true,
				revokedAt: true,
				enrollment: {
					select: {
						fullName: true,
						batch: {
							select: { program: { select: { title: true } } },
						},
					},
				},
			},
		});

		if (!row) {
			return null;
		}

		return {
			certificateNo: row.certificateNo,
			studentName: row.enrollment.fullName,
			programTitle: row.enrollment.batch.program.title,
			issuedAt: row.issuedAt.toISOString(),
			revoked: row.revokedAt !== null,
		};
	});
