// src/server/certificate/certificate-code.ts
// Public-facing certificate codes. The prefix keeps the credential
// recognisable, but the suffix is high-entropy so /verify/<code> cannot be
// enumerated. Crockford-style base32 omits I/L/O/U to avoid transcription
// mistakes on printed certificates.
import { randomInt } from "node:crypto";

const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CODE_LENGTH = 8;

/** e.g. UBT-2026-7K3M9Q2X (16 characters, fits VarChar(20)). */
export function generateCertificateCode(now = new Date()): string {
	let suffix = "";
	for (let i = 0; i < CODE_LENGTH; i++) {
		suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
	}
	return `UBT-${now.getFullYear()}-${suffix}`;
}
