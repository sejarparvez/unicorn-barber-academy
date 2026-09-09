import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { TOPIC_LABELS } from "@/data/contact";
import { guardPublicEndpoint } from "@/server/api-guard";
import { validateContactInput } from "@/server/contact-validate";
import { saveInquiry } from "@/server/inquiry-db";
import { contactInquiryEmail, sendMail } from "@/server/mail";
import { clientIp } from "@/server/rate-limit";
import { getSiteSettings } from "@/server/settings-db";

export const Route = createFileRoute("/api/contact")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = guardPublicEndpoint(request, {
					rateKey: `contact:${clientIp(request)}`,
					rateMax: 5,
					rateWindowMs: 60_000,
				});
				if (!guard.ok) return guard.response;
				try {
					const body = await request.json();
					const validated = validateContactInput(body);
					if (!validated.ok) {
						return json(
							{ message: validated.message },
							{ status: validated.status },
						);
					}

					const inquiryId = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
					const { contact } = await getSiteSettings();
					// Durable inbox record first (never blocks the response), then
					// the notification email — a missed email no longer loses leads.
					await saveInquiry({
						name: validated.name,
						email: validated.email,
						phone: validated.phone ?? null,
						subject: validated.subject,
						program: validated.program ?? null,
						message: validated.message,
					});
					const sent = await sendMail({
						to: contact.email,
						replyTo: validated.email,
						subject: `[Website] ${TOPIC_LABELS[validated.subject]} — ${inquiryId}`,
						html: contactInquiryEmail({
							name: validated.name,
							email: validated.email,
							phone: validated.phone || undefined,
							topicLabel: TOPIC_LABELS[validated.subject],
							program: validated.program || undefined,
							message: validated.message,
						}),
					});
					if (!sent) {
						console.warn(
							`[contact] inquiry ${inquiryId} could not be emailed — RESEND_API_KEY unset or delivery failed`,
						);
					}

					return json({
						success: true,
						message: "Inquiry submitted successfully",
						inquiryId,
					});
				} catch (error) {
					console.error("Contact submission error:", error);
					return json({ message: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
