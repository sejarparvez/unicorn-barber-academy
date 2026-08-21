import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

// Keep in sync with SUBJECTS in src/routes/contact.tsx (kept inline here so
// the server bundle doesn't pull in the page component).
const VALID_SUBJECTS = ["student", "partner", "press", "other"];

export const Route = createFileRoute("/api/contact")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const body = await request.json();
					const { name, email, phone, subject, program, message } = body;

					// Validate required fields
					if (!name || !email || !subject || !message) {
						return json(
							{ message: "All required fields must be filled" },
							{ status: 400 },
						);
					}

					// Validate email format
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(email)) {
						return json({ message: "Invalid email format" }, { status: 400 });
					}

					// Validate optional phone format when provided
					if (phone) {
						const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
						if (!phoneRegex.test(phone)) {
							return json({ message: "Invalid phone number" }, { status: 400 });
						}
					}

					// Validate subject
					if (!VALID_SUBJECTS.includes(subject)) {
						return json({ message: "Invalid subject" }, { status: 400 });
					}

					// In a real application, you would:
					// 1. Save to database / helpdesk
					// 2. Send acknowledgement email
					// 3. Route to the right desk (admissions / partnerships / press)

					console.log("New contact inquiry:", {
						name,
						email,
						phone: phone ?? null,
						subject,
						program: program ?? null,
						message,
						submittedAt: new Date().toISOString(),
					});

					return json({
						success: true,
						message: "Inquiry submitted successfully",
						inquiryId: `MSG-${Date.now()}`,
					});
				} catch (error) {
					console.error("Contact submission error:", error);
					return json({ message: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
