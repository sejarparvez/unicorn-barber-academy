import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { CONTACT } from "@/data/site";
import { contactInquiryEmail, sendMail } from "@/server/mail";
import { clientIp, isSameOrigin, overRateLimit } from "@/server/rate-limit";

// Keep in sync with SUBJECTS in src/routes/contact.tsx (kept inline here so
// the server bundle doesn't pull in the page component).
const VALID_SUBJECTS = ["student", "partner", "press", "other"] as const;
const TOPIC_LABELS: Record<(typeof VALID_SUBJECTS)[number], string> = {
	student: "Admissions",
	partner: "Partnership",
	press: "Press & media",
	other: "Other",
};

function text(value: unknown, max: number): string {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/contact")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Unauthenticated endpoint: block cross-site submissions and cap
				// per-IP volume so this can't be used as a spam/log-flooding vector.
				if (!isSameOrigin(request)) {
					return json({ message: "Forbidden" }, { status: 403 });
				}
				if (overRateLimit(`contact:${clientIp(request)}`, 5, 60_000)) {
					return json(
						{ message: "Too many requests. Please try again later." },
						{ status: 429 },
					);
				}
				try {
					const body = await request.json();

					const name = text(body.name, 120);
					const email = text(body.email, 254);
					const phone = text(body.phone, 30);
					const program = text(body.program, 120);
					const message = text(body.message, 5000);
					const subject = typeof body.subject === "string" ? body.subject : "";

					if (!name || !email || !subject || !message) {
						return json(
							{ message: "All required fields must be filled" },
							{ status: 400 },
						);
					}

					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(email)) {
						return json({ message: "Invalid email format" }, { status: 400 });
					}

					if (phone) {
						const phoneRegex = /^[+]?[\d\s\-()]{10,30}$/;
						if (!phoneRegex.test(phone)) {
							return json({ message: "Invalid phone number" }, { status: 400 });
						}
					}

					const topic = (VALID_SUBJECTS as readonly string[]).includes(subject)
						? (subject as (typeof VALID_SUBJECTS)[number])
						: null;
					if (!topic) {
						return json({ message: "Invalid subject" }, { status: 400 });
					}

					const inquiryId = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
					const sent = await sendMail({
						to: CONTACT.email,
						replyTo: email,
						subject: `[Website] ${TOPIC_LABELS[topic]} — ${inquiryId}`,
						html: contactInquiryEmail({
							name,
							email,
							phone: phone || undefined,
							topicLabel: TOPIC_LABELS[topic],
							program: program || undefined,
							message,
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
