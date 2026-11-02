// src/lib/api/enrollment.ts
// Browser-side client for enrollment endpoints (mirrors lib/api/blog-admin.ts).
import { http } from "./http";

type SubmitApplicationPayload = {
	intakeId: number;
	fullName: string;
	phone: string;
	fatherName: string;
	motherName: string;
	dateOfBirth: string;
	nationality: string;
	gender: "male" | "female" | "other";
	nidOrBirthCertNo: string | null;
	whatsapp: string | null;
	presentAddress: string;
	permanentAddress: string;
	emergencyName: string;
	emergencyRelation: string;
	emergencyMobile: string;
	emergencyAddress: string;
	education: string;
	hasBarberExperience: boolean;
	barberExperiencePeriod: string | null;
	hasPriorTraining: boolean;
	priorTrainingInstitute: string | null;
	courseGoal: string;
	declarationAccepted: boolean;
	hearAbout?: string | null;
};

type SubmitResult =
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
