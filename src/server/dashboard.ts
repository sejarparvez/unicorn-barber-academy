import { createServerFn } from '@tanstack/react-start';
import type { EnrollmentStatus } from '@/components/pages/enroll/types';
import { ensureSession } from '@/lib/auth.functions';
import { db } from '@/lib/db';
import { interestLabel } from '@/server/admin/enquiries';

export type AdminOverviewStats = {
	pendingApplications: number;
	activeStudents: number;
	newEnquiries: number;
	runningBatches: number;
	collected: number;
	outstanding: number;
	certificatesIssued: number;
	completedPrograms: number;
};

export type AdminOverviewApplication = {
	id: string;
	studentName: string;
	programTitle: string;
	batchName: string;
	status: EnrollmentStatus;
	createdAt: string;
};

export type AdminOverviewEnquiry = {
	id: string;
	name: string;
	interestLabel: string;
	message: string;
	createdAt: string;
};

export type AdminOverview = {
	stats: AdminOverviewStats;
	recentApplications: AdminOverviewApplication[];
	recentEnquiries: AdminOverviewEnquiry[];
};

export type StudentOverviewStats = {
	activePrograms: number;
	pendingApplications: number;
	completedPrograms: number;
	certificates: number;
	balance: number;
};

export type StudentOverviewProgram = {
	id: string;
	programTitle: string;
	programSlug: string;
	batchName: string;
	status: EnrollmentStatus;
};

export type StudentOverview = {
	stats: StudentOverviewStats;
	recentPrograms: StudentOverviewProgram[];
};

export type DashboardOverview =
	| { role: 'admin'; admin: AdminOverview }
	| { role: 'student'; student: StudentOverview };

async function loadAdminOverview(): Promise<AdminOverview> {
	const [
		pendingApplications,
		activeStudents,
		newEnquiries,
		runningBatches,
		certificatesIssued,
		completedPrograms,
		collected,
		activeEnrollments,
		applicationRows,
		enquiryRows,
		programs,
	] = await Promise.all([
		db.enrollment.count({
			where: { status: { in: ['applied', 'waitlisted'] } },
		}),
		db.enrollment.count({ where: { status: 'active' } }),
		db.enquiry.count({ where: { status: 'new' } }),
		db.batch.count({ where: { status: 'running' } }),
		db.certificate.count(),
		db.enrollment.count({ where: { status: 'completed' } }),
		db.payment.aggregate({ _sum: { amount: true } }),
		db.enrollment.findMany({
			where: { status: 'active' },
			select: {
				batch: { select: { program: { select: { price: true } } } },
				payments: { select: { amount: true } },
			},
		}),
		db.enrollment.findMany({
			orderBy: { createdAt: 'desc' },
			take: 5,
			select: {
				id: true,
				status: true,
				createdAt: true,
				user: { select: { name: true } },
				batch: {
					select: { name: true, program: { select: { title: true } } },
				},
			},
		}),
		db.enquiry.findMany({
			orderBy: { createdAt: 'desc' },
			take: 4,
			select: {
				id: true,
				name: true,
				interest: true,
				message: true,
				createdAt: true,
			},
		}),
		db.program.findMany({ select: { slug: true, title: true } }),
	]);

	const outstanding = activeEnrollments.reduce((sum, enrollment) => {
		const paid = enrollment.payments.reduce(
			(total, payment) => total + payment.amount,
			0,
		);
		return sum + Math.max(enrollment.batch.program.price - paid, 0);
	}, 0);

	const programTitles = new Map(
		programs.map((program) => [program.slug, program.title]),
	);

	return {
		stats: {
			pendingApplications,
			activeStudents,
			newEnquiries,
			runningBatches,
			collected: collected._sum.amount ?? 0,
			outstanding,
			certificatesIssued,
			completedPrograms,
		},
		recentApplications: applicationRows.map((row) => ({
			id: row.id,
			studentName: row.user.name,
			programTitle: row.batch.program.title,
			batchName: row.batch.name,
			status: row.status,
			createdAt: row.createdAt.toISOString(),
		})),
		recentEnquiries: enquiryRows.map((row) => ({
			id: row.id,
			name: row.name,
			interestLabel: interestLabel(row.interest, programTitles),
			message: row.message,
			createdAt: row.createdAt.toISOString(),
		})),
	};
}

async function loadStudentOverview(userId: string): Promise<StudentOverview> {
	const [enrollments, certificates] = await Promise.all([
		db.enrollment.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				status: true,
				createdAt: true,
				batch: {
					select: {
						name: true,
						program: { select: { title: true, slug: true, price: true } },
					},
				},
				payments: { select: { amount: true } },
			},
		}),
		db.certificate.count({ where: { enrollment: { userId } } }),
	]);

	let balance = 0;

	for (const enrollment of enrollments) {
		if (enrollment.status !== 'active') {
			continue;
		}

		const paid = enrollment.payments.reduce(
			(sum, payment) => sum + payment.amount,
			0,
		);
		balance += Math.max(enrollment.batch.program.price - paid, 0);
	}

	return {
		stats: {
			activePrograms: enrollments.filter((row) => row.status === 'active')
				.length,
			pendingApplications: enrollments.filter(
				(row) => row.status === 'applied' || row.status === 'waitlisted',
			).length,
			completedPrograms: enrollments.filter((row) => row.status === 'completed')
				.length,
			certificates,
			balance,
		},
		recentPrograms: enrollments.slice(0, 3).map((row) => ({
			id: row.id,
			programTitle: row.batch.program.title,
			programSlug: row.batch.program.slug,
			batchName: row.batch.name,
			status: row.status,
		})),
	};
}

/** Everything the dashboard overview needs, tailored to the signed-in role. */
export const getDashboardOverview = createServerFn({ method: 'GET' }).handler(
	async (): Promise<DashboardOverview> => {
		const session = await ensureSession();

		if (session.user.role === 'admin') {
			return { role: 'admin', admin: await loadAdminOverview() };
		}

		return {
			role: 'student',
			student: await loadStudentOverview(session.user.id),
		};
	},
);
