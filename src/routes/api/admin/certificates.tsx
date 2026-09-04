// routes/api/admin/certificates.tsx
// POST — issue a certificate for a completed, fee-paid application.
// Eligibility and one-per-application rules live in certificate-db.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { issueCertificateForApplication } from "@/server/certificate-db";
import { getApplicationDetail } from "@/server/enrollment-db";
import { certificateIssuedEmail, sendMail } from "@/server/mail";

const REASON_MESSAGES = {
	"not-found": "Application not found",
	"not-completed":
		"Candidates must be marked completed before a certificate can be issued.",
	"fee-unpaid": "The registration fee must be recorded as paid before issuing.",
	"already-issued": "This application already has a certificate.",
} as const;

export const Route = createFileRoute("/api/admin/certificates")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				const applicationId = Number.parseInt(
					String(body.applicationId ?? ""),
					10,
				);
				if (!Number.isInteger(applicationId) || applicationId < 1) {
					return json({ message: "Invalid application id" }, { status: 400 });
				}

				try {
					const result = await issueCertificateForApplication(
						applicationId,
						guard.userId,
					);
					if (!result.ok) {
						return json(
							{ message: REASON_MESSAGES[result.reason] },
							{ status: result.reason === "not-found" ? 404 : 409 },
						);
					}
					// Send certificate issuance email (non-fatal on failure).
					try {
						const detail = await getApplicationDetail(applicationId);
						if (detail) {
							const app = detail.application;
							await sendMail({
								to: app.email,
								subject: `Your certificate is ready (${result.code}) | Unicorn Barber Training Academy`,
								html: certificateIssuedEmail({
									fullName: app.fullName,
									programTitle: app.programTitle,
									cohortLabel:
										app.cohort === "day" ? "Day cohort" : "Evening cohort",
									certificateCode: result.code,
									dashboardUrl: `/dashboard`,
								}),
							});
						}
					} catch (emailError) {
						console.error("[certificates] issuance email failed:", emailError);
					}
					return json({ ok: true, code: result.code });
				} catch (error) {
					console.error("[certificates] issue failed:", error);
					return json(
						{ message: "Could not issue certificate. Please try again." },
						{ status: 500 },
					);
				}
			},
		},
	},
});
