// src/lib/certificates.ts
// Client-safe certificate domain types crossing the server/client boundary
// (same contract style as lib/blog.ts / lib/enrollment.ts). Server modules
// re-use these so wire shapes stay single-sourced.
import type { Cohort } from "@/lib/enrollment";

export type CertificateRecord = {
	id: number;
	code: string;
	userId: number;
	holderName: string;
	programSlug: string;
	programTitle: string | null;
	cohort: Cohort;
	issuedOn: string; // yyyy-mm-dd
	issuedBy: number | null;
	revokedAt: string | null;
	revokedBy: number | null;
	revokedReason: string | null;
};

/** Projection returned by the public /verify/<code> lookup. */
export type VerifyResult =
	| {
			kind: "valid" | "revoked";
			code: string;
			holderName: string;
			programTitle: string | null;
			programSlug: string;
			cohort: string;
			issuedOn: string;
	  }
	| { kind: "unknown" | "rate-limited" };
