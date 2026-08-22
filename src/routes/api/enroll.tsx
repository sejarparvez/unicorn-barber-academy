import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { clientIp, isSameOrigin, overRateLimit } from "@/lib/api-guard";

export const Route = createFileRoute("/api/enroll")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				// Unauthenticated endpoint: block cross-site submissions and cap
				// per-IP volume so this can't be used as a spam/log-flooding vector.
				if (!isSameOrigin(request)) {
					return json({ message: "Forbidden" }, { status: 403 });
				}
				if (overRateLimit(`enroll:${clientIp(request)}`, 5, 60_000)) {
					return json(
						{ message: "Too many requests. Please try again later." },
						{ status: 429 },
					);
				}
				try {
					const body = await request.json();
					const { name, email, phone, track, program, cohort, message } = body;

					// Validate required fields
					if (!name || !email || !phone || !track || !program || !cohort) {
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

					// Validate phone format (basic check)
					const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
					if (!phoneRegex.test(phone)) {
						return json({ message: "Invalid phone number" }, { status: 400 });
					}

					// Validate track
					if (!["barbering", "beauty"].includes(track)) {
						return json({ message: "Invalid track" }, { status: 400 });
					}

					// Validate cohort
					if (!["day", "evening"].includes(cohort)) {
						return json({ message: "Invalid cohort" }, { status: 400 });
					}

					// In a real application, you would:
					// 1. Save to database
					// 2. Send confirmation email
					// 3. Notify admissions team
					// 4. Integrate with CRM

					console.log("New enrollment application:", {
						name,
						email,
						phone,
						track,
						program,
						cohort,
						message,
						submittedAt: new Date().toISOString(),
					});

					// Simulate processing delay
					await new Promise((resolve) => setTimeout(resolve, 500));

					return json({
						success: true,
						message: "Application submitted successfully",
						applicationId: `ENR-${Date.now()}`,
					});
				} catch (error) {
					console.error("Enrollment submission error:", error);
					return json({ message: "Internal server error" }, { status: 500 });
				}
			},
		},
	},
});
