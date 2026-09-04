// src/lib/api/certificate-admin.ts
// Admin-side client for certificate management (issue/revoke).
import { extractErrorMessage, http } from "./http";

export async function issueCertificate(applicationId: number): Promise<string> {
	try {
		const res = await http.post<{ code: string }>("/api/admin/certificates", {
			applicationId,
		});
		return res.data.code;
	} catch (error) {
		throw new Error(await extractErrorMessage(error));
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
		throw new Error(await extractErrorMessage(error));
	}
}
