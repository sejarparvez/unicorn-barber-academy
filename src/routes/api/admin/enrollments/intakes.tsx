// routes/api/admin/enrollments/intakes.tsx
// POST — create a program intake (cohort instance with a seat cap).
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { createIntake } from "@/server/enrollment-db";
import { parseIntakePayload } from "@/server/enrollment-validate";

export const Route = createFileRoute("/api/admin/enrollments/intakes")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}

				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				const parsed = parseIntakePayload(body);
				if (!parsed.ok) {
					return json({ message: parsed.message }, { status: 400 });
				}

				const result = await createIntake(parsed.value);
				if (!result.ok) {
					const messages = {
						exists:
							"An intake for this program, cohort, and date already exists.",
						"not-found": "Intake not found",
						"has-applications": "Intake has applications",
						"below-occupied": "Seats below occupied count",
					} as const;
					return json(
						{ message: messages[result.reason] },
						{ status: result.reason === "exists" ? 409 : 400 },
					);
				}
				return json({ ok: true }, { status: 201 });
			},
		},
	},
});
