// src/lib/api/enrollment.ts
// Browser-side client for enrollment endpoints (mirrors lib/api/blog-admin.ts).
import { http } from "./http";

export type SubmitApplicationPayload = {
	intakeId: number;
	phone: string;
	experienceNote?: string | null;
	hearAbout?: string | null;
};

export type SubmitResult =
	| { ok: true; reference: string }
	| { ok: false; message: string };

export async function submitApplication(
	payload: SubmitApplicationPayload,
): Promise<SubmitResult> {
	try {
		const res = await http.post<{
			success: boolean;
			reference: string;
		}>("/api/enroll", payload);
		return { ok: true, reference: res.data.reference };
	} catch (error) {
		const message =
			(typeof error === "object" && error !== null
				? (error as { response?: { data?: { message?: string } } }).response
						?.data?.message
				: undefined) ?? "Something went wrong. Please try again.";
		return { ok: false, message };
	}
}
