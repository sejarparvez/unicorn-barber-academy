import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { formatStartsOn } from "@/lib/enrollment";
import { guardPublicEndpoint } from "@/server/api-guard";
import { auth } from "@/server/auth";
import {
	listOpenIntakes,
	submitApplication,
} from "@/server/enrollment/enrollment-db";
import { validateApplicationPayload } from "@/server/enrollment/enrollment-validate";
import { applicationReceivedEmail, sendMail } from "@/server/mail";
import { clientIp } from "@/server/rate-limit";

export const Route = createFileRoute("/api/enroll")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = guardPublicEndpoint(request, {
					rateKey: `enroll:${clientIp(request)}`,
					rateMax: 5,
					rateWindowMs: 60_000,
				});
				if (!guard.ok) return guard.response;

				const session = await auth.api.getSession({
					headers: request.headers,
				});
				if (!session) {
					return json({ message: "Sign in to apply" }, { status: 401 });
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}
				const parsed = validateApplicationPayload(body);
				if (!parsed.ok) {
					return json({ message: parsed.message }, { status: 400 });
				}

				let result: Awaited<ReturnType<typeof submitApplication>>;
				try {
					result = await submitApplication({
						userId: Number(session.user.id),
						intakeId: parsed.value.intakeId,
						fullName: parsed.value.fullName,
						email: session.user.email,
						phone: parsed.value.phone,
						fatherName: parsed.value.fatherName,
						motherName: parsed.value.motherName,
						dateOfBirth: parsed.value.dateOfBirth,
						nationality: parsed.value.nationality,
						gender: parsed.value.gender,
						nidOrBirthCertNo: parsed.value.nidOrBirthCertNo,
						whatsapp: parsed.value.whatsapp,
						presentAddress: parsed.value.presentAddress,
						permanentAddress: parsed.value.permanentAddress,
						emergencyName: parsed.value.emergencyName,
						emergencyRelation: parsed.value.emergencyRelation,
						emergencyMobile: parsed.value.emergencyMobile,
						emergencyAddress: parsed.value.emergencyAddress,
						education: parsed.value.education,
						hasBarberExperience: parsed.value.hasBarberExperience,
						barberExperiencePeriod: parsed.value.barberExperiencePeriod,
						hasPriorTraining: parsed.value.hasPriorTraining,
						priorTrainingInstitute: parsed.value.priorTrainingInstitute,
						courseGoal: parsed.value.courseGoal,
						hearAbout: parsed.value.hearAbout,
					});
				} catch (error) {
					console.error("[enroll] submit failed:", error);
					return json(
						{ message: "Could not submit application. Please try again." },
						{ status: 500 },
					);
				}

				if (!result.ok) {
					const messages = {
						full: "That cohort just filled up � please pick another intake.",
						closed: "That cohort is no longer accepting applications.",
						duplicate:
							"You already have an active application for this cohort.",
						past: "That cohort has already started.",
					} as const;
					return json(
						{ message: messages[result.reason] },
						{ status: result.reason === "duplicate" ? 409 : 400 },
					);
				}

				// Confirmation email with the reference (non-fatal on failure).
				try {
					const intakes = await listOpenIntakes();
					const intake = intakes.find((i) => i.id === parsed.value.intakeId);
					if (intake) {
						await sendMail({
							to: session.user.email,
							subject: `Application received (${result.reference}) | Unicorn Barber Training Academy`,
							html: applicationReceivedEmail({
								reference: result.reference,
								fullName: parsed.value.fullName,
								programTitle: intake.programTitle,
								cohortLabel:
									intake.cohort === "day" ? "Day cohort" : "Evening cohort",
								startsOnDisplay: formatStartsOn(intake.startsOn),
							}),
						});
					}
				} catch (error) {
					console.error("[enroll] confirmation email failed:", error);
				}

				return json(
					{
						success: true,
						reference: result.reference,
						message: "Application submitted successfully",
					},
					{ status: 201 },
				);
			},
		},
	},
});
