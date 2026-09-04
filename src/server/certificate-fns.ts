// src/server/certificate-fns.ts
// Server-function wrappers around certificate-db. The student list and the
// print-page fetch are session/ownership scoped; the verify lookup is public
// and projects only what a verifier is allowed to see (never email/phone).
// QR generation lives here too so the Node-only `qrcode` package never
// reaches the client bundle.
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import type { CertificateRecord, VerifyResult } from "@/lib/certificates";
import {
	getCertificateByApplicationId,
	getCertificateByCode,
	getCertificateForUser,
	listCertificatesForUser,
} from "@/server/certificate-db";
import { clampId, runSafe } from "@/server/fn-utils";
import { requireAdminSession } from "@/server/guards";
import { clientIp, overRateLimit } from "@/server/rate-limit";
import { getSession } from "@/server/session";

/**
 * Generate a QR code data URL pointing at a public verify URL.
 * `qrcode` (Node-only) stays on the server via this server function.
 */
export const generateCertificateQrFn = createServerFn({ method: "GET" })
	.validator((input: { url: string }) => input)
	.handler(async ({ data }): Promise<{ dataUrl: string }> => {
		const { default: QRCode } = await import("qrcode");
		const dataUrl = await QRCode.toDataURL(data.url, {
			margin: 1,
			width: 240,
			color: { dark: "#1c1c1a", light: "#ffffff" },
		});
		return { dataUrl };
	});

export const listMyCertificatesFn = createServerFn({
	method: "GET",
}).handler(async (): Promise<CertificateRecord[]> => {
	const session = await getSession();
	if (!session) return [];
	return runSafe(() => listCertificatesForUser(Number(session.user.id)));
});

export const getMyCertificateFn = createServerFn({ method: "GET" })
	.validator((input: { id: number }) => input)
	.handler(async ({ data }): Promise<CertificateRecord | null> => {
		const session = await getSession();
		if (!session) return null;
		return runSafe(() =>
			getCertificateForUser(clampId(data.id), Number(session.user.id)),
		);
	});

export const getCertificateForApplicationFn = createServerFn({
	method: "GET",
})
	.validator((input: { applicationId: number }) => input)
	.handler(async ({ data }): Promise<CertificateRecord | null> => {
		await requireAdminSession();
		return runSafe(() =>
			getCertificateByApplicationId(clampId(data.applicationId)),
		);
	});

export const verifyCertificateFn = createServerFn({ method: "GET" })
	.validator((input: { code: string }) => input)
	.handler(
		async ({ data }): Promise<VerifyResult> =>
			runSafe(async () => {
				// Rate-limit lookups per-IP to discourage brute-force enumeration.
				const ip = clientIp(getRequest());
				if (overRateLimit(`verify:cert:${ip}`, 30, 60_000)) {
					return { kind: "rate-limited" as const };
				}
				const record = await getCertificateByCode(
					data.code.trim().toUpperCase(),
				);
				if (!record) return { kind: "unknown" as const };
				return {
					kind: record.revokedAt ? ("revoked" as const) : ("valid" as const),
					code: record.code,
					holderName: record.holderName,
					programTitle: record.programTitle,
					programSlug: record.programSlug,
					cohort: record.cohort,
					issuedOn: record.issuedOn,
				};
			}),
	);
