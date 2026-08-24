// src/lib/api/certificate-admin.ts
// Admin-side client for certificate management (issue/revoke).
import { http } from "./http";

async function errorOf(error: unknown): Promise<string> {
	if (typeof error === "object" && error !== null) {
		const data = (error as { response?: { data?: { message?: string } } })
			.response?.data;
		if (data?.message) return data.message;
	}
	return "Something went wrong. Please try again.";
}

export async function issueCertificate(applicationId: number): Promise<string> {
	try {
		const res = await http.post<{ code: string }>("/api/admin/certificates", {
			applicationId,
		});
		return res.data.code;
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}

export async function setCertificateRevoked(
	id: number,
	revoked: boolean,
	reason?: string | null,
): Promise<void> {
	try {
		await http.patch(`/api/admin/certificates/${id}`, { revoked, reason });
	} catch (error) {
		throw new Error(await errorOf(error));
	}
}
