// src/server/certificate/certificate-validate.ts
// Input validation for certificate server functions.

import type {
	CertificateListFilters,
	CertificateListStatus,
} from "@/lib/certificates";

const VERIFY_PATH = /^\/verify\/[A-Z0-9-]{4,64}$/;

const LIST_STATUSES: readonly CertificateListStatus[] = [
	"all",
	"active",
	"revoked",
];

/** Normalise the admin registry query string. */
export function parseCertificateListFilters(
	raw: unknown,
): Required<CertificateListFilters> {
	const input =
		raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
	const search =
		typeof input.search === "string" ? input.search.trim().slice(0, 120) : "";
	const status = LIST_STATUSES.includes(input.status as CertificateListStatus)
		? (input.status as CertificateListStatus)
		: "all";
	const pageInput =
		typeof input.page === "number"
			? input.page
			: Number.parseInt(String(input.page ?? ""), 10);
	const page =
		Number.isInteger(pageInput) && pageInput > 0
			? Math.min(pageInput, 10_000)
			: 1;
	return { search, status, page };
}

export function parseVerifyUrl(
	raw: unknown,
	appOrigin: string,
	requestHost: string,
): { ok: true; url: string } | { ok: false; message: string } {
	if (typeof raw !== "string" || raw.length === 0 || raw.length > 200)
		return { ok: false, message: "Invalid URL" };
	let parsed: URL;
	try {
		parsed = new URL(raw);
	} catch {
		return { ok: false, message: "Invalid URL" };
	}
	if (!VERIFY_PATH.test(parsed.pathname))
		return { ok: false, message: "Invalid verify URL" };
	try {
		if (parsed.origin !== new URL(appOrigin).origin)
			return { ok: false, message: "Invalid verify URL" };
	} catch {
		if (parsed.host !== requestHost)
			return { ok: false, message: "Invalid verify URL" };
	}
	return { ok: true, url: parsed.toString() };
}
