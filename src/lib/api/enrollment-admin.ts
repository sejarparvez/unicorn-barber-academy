// src/lib/api/enrollment-admin.ts
// Browser-side client for the admissions endpoints.
import { csvCell } from "@/lib/csv";
import type { ApplicationStatus } from "@/lib/enrollment";
import { extractErrorMessage, http } from "./http";

export async function setApplicationStatus(
	id: number,
	status: ApplicationStatus,
	note?: string | null,
): Promise<{ userRoleUpgraded: boolean }> {
	try {
		const res = await http.patch<{ userRoleUpgraded: boolean }>(
			`/api/admin/enrollments/${id}`,
			{ action: "status", status, note },
		);
		return { userRoleUpgraded: Boolean(res.data.userRoleUpgraded) };
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function recordFeePayment(
	id: number,
	input: { amountTaka: number; method: string; receipt?: string | null },
): Promise<void> {
	try {
		await http.patch(`/api/admin/enrollments/${id}`, {
			action: "record-payment",
			...input,
		});
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function voidFeePayment(
	id: number,
	paymentId: number,
): Promise<void> {
	try {
		await http.patch(`/api/admin/enrollments/${id}`, {
			action: "void-payment",
			paymentId,
		});
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function createIntake(payload: {
	programSlug: string;
	cohort: string;
	startsOn: string;
	seatsTotal: number;
}): Promise<void> {
	try {
		await http.post("/api/admin/enrollments/intakes", payload);
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function updateIntake(
	id: number,
	patch: { startsOn?: string; seatsTotal?: number; isOpen?: boolean },
): Promise<void> {
	try {
		await http.patch(`/api/admin/enrollments/intakes/${id}`, patch);
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function deleteIntake(id: number): Promise<void> {
	try {
		await http.delete(`/api/admin/enrollments/intakes/${id}`);
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export async function bulkSetStatus(
	ids: number[],
	status: ApplicationStatus,
	note?: string | null,
): Promise<{ applied: number; failed: Array<{ id: number; reason: string }> }> {
	try {
		const res = await http.post<{
			applied: number;
			failed: Array<{ id: number; reason: string }>;
		}>("/api/admin/enrollments/bulk", { ids, status, note });
		return res.data;
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
	}
}

export type StatusLogEntry = {
	id: number;
	applicationId: number;
	adminUserId: number;
	adminName: string | null;
	fromStatus: string | null;
	toStatus: string;
	note: string | null;
	createdAt: string;
};

/** Client-side CSV export of the currently visible applications. */
export function downloadApplicationsCsv(
	rows: Array<Record<string, string | number>>,
): void {
	const headers = [
		"Reference",
		"Status",
		"Name",
		"Email",
		"Phone",
		"Program",
		"Cohort",
		"Starts",
		"Fee",
		"Submitted",
	];
	const lines = [
		headers.join(","),
		...rows.map((row) => Object.values(row).map(csvCell).join(",")),
	];
	const blob = new Blob([lines.join("\n")], { type: "text/csv" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
	anchor.click();
	URL.revokeObjectURL(url);
}
