import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { formatStartsOn } from "@/lib/enrollment";
import { auth } from "@/server/auth";
import { listOpenIntakes, submitApplication } from "@/server/enrollment-db";
import { validateApplicationPayload } from "@/server/enrollment-validate";
import { applicationReceivedEmail, sendMail } from "@/server/mail";
import { clientIp, isSameOrigin, overRateLimit } from "@/server/rate-limit";

export const Route = createFileRoute("/api/enroll")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Same-origin + per-IP cap stay on even though the endpoint now
				// requires a session — cheap defense against scripted abuse.
				if (!isSameOrigin(request)) {
					return json({ message: "Forbidden" }, { status: 403 });
				}
				if (overRateLimit(`enroll:${clientIp(request)}`, 5, 60_000)) {
					return json(
						{ message: "Too many requests. Please try again later." },
						{ status: 429 },
					);
				}

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

				const result = await submitApplication({
					userId: Number(session.user.id),
					intakeId: parsed.value.intakeId,
					fullName: session.user.name || "Applicant",
					email: session.user.email,
					phone: parsed.value.phone,
					experienceNote: parsed.value.experienceNote,
					hearAbout: parsed.value.hearAbout,
				});

				if (!result.ok) {
					const messages = {
						full: "That cohort just filled up — please pick another intake.",
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
								fullName: session.user.name || "there",
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
