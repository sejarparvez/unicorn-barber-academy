// src/server/certificate/certificate-validate.ts
// Input validation for certificate server functions.

const VERIFY_PATH = /^\/verify\/[A-Z0-9-]{4,64}$/;

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
