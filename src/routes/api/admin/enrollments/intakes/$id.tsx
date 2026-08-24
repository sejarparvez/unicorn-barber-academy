// routes/api/admin/enrollments/intakes/$id.tsx
// PATCH — adjust start date / seats / open flag (never below occupied seats).
// DELETE — remove an intake; blocked while applications reference it.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { requireAdminApi } from "@/server/admin-api";
import { deleteIntake, updateIntake } from "@/server/enrollment-db";
import { isValidFutureStartDate } from "@/server/enrollment-validate";

type Params = { id: string };

const REASON_MESSAGES = {
	exists: "An identical intake already exists.",
	"not-found": "Intake not found",
	"has-applications":
		"This intake has applications — close it instead of deleting it.",
	"below-occupied":
		"Seats cannot go below the number already held by applicants.",
} as const;

export const Route = createFileRoute("/api/admin/enrollments/intakes/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid intake id" }, { status: 400 });
				}

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}

				const patch: {
					startsOn?: string;
					seatsTotal?: number;
					isOpen?: boolean;
				} = {};
				if (
					typeof body.startsOn === "string" &&
					isValidFutureStartDate(body.startsOn)
				) {
					patch.startsOn = body.startsOn;
				} else if (body.startsOn !== undefined) {
					return json(
						{ message: "Start date must be a valid future date" },
						{ status: 400 },
					);
				}
				const seats = Number.parseInt(String(body.seatsTotal ?? ""), 10);
				if (Number.isInteger(seats)) patch.seatsTotal = seats;
				if (typeof body.isOpen === "boolean") patch.isOpen = body.isOpen;

				if (Object.keys(patch).length === 0) {
					return json({ message: "Nothing to update" }, { status: 400 });
				}

				const result = await updateIntake(id, patch);
				if (!result.ok) {
					return json(
						{ message: REASON_MESSAGES[result.reason] },
						{ status: result.reason === "not-found" ? 404 : 400 },
					);
				}
				return json({ ok: true });
			},
			DELETE: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid intake id" }, { status: 400 });
				}

				const result = await deleteIntake(id);
				if (!result.ok) {
					return json(
						{ message: REASON_MESSAGES[result.reason] },
						{ status: result.reason === "not-found" ? 404 : 409 },
					);
				}
				return json({ ok: true });
			},
		},
	},
});
