// routes/api/admin/enrollments/$id.tsx
// PATCH /api/admin/enrollments/:id — admissions actions on one application.
// Body: { action: "status", status, note? } | { action: "fee", paid }
// Status transitions to a terminal decision trigger the applicant email
// (non-fatal on failure) — see updateApplicationStatus for DB side effects.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseApplicationStatus } from "@/lib/enrollment";
import { requireAdminApi } from "@/server/admin-api";
import {
	getApplicationDetail,
	setApplicationFee,
	updateApplicationStatus,
} from "@/server/enrollment-db";
import {
	applicationApprovedEmail,
	applicationRejectedEmail,
	applicationWaitlistedEmail,
	sendMail,
} from "@/server/mail";

type Params = { id: string };

export const Route = createFileRoute("/api/admin/enrollments/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const guard = await requireAdminApi(request);
				if (!guard.ok) {
					return json({ message: guard.message }, { status: guard.status });
				}
				const id = Number.parseInt((params as Params).id, 10);
				if (!Number.isInteger(id) || id < 1) {
					return json({ message: "Invalid application id" }, { status: 400 });
				}

				let body: Record<string, unknown>;
				try {
					body = await request.json();
				} catch {
					return json({ message: "Invalid JSON body" }, { status: 400 });
				}
				const action = typeof body.action === "string" ? body.action : null;

				if (action === "fee") {
					const updated = await setApplicationFee(id, body.paid === true);
					if (!updated) {
						return json({ message: "Application not found" }, { status: 404 });
					}
					return json({ ok: true });
				}

				if (action === "status") {
					const status = parseApplicationStatus(body.status);
					if (!status) {
						return json({ message: "Unknown status" }, { status: 400 });
					}
					const note =
						typeof body.note === "string" && body.note.trim()
							? body.note.trim().slice(0, 2000)
							: null;

					const result = await updateApplicationStatus({
						id,
						status,
						adminUserId: guard.userId,
						note,
					});
					if (!result.ok) {
						return json({ message: "Application not found" }, { status: 404 });
					}

					// Decision emails — non-fatal; admission state already committed.
					if (result.emailKind) {
						try {
							const detail = await getApplicationDetail(id);
							if (detail) {
								const app = detail.application;
								const data = {
									reference: app.reference,
									fullName: app.fullName,
									programTitle: app.programTitle,
									cohortLabel:
										app.cohort === "day" ? "Day cohort" : "Evening cohort",
									startsOnDisplay: new Date(app.startsOn).toLocaleDateString(
										"en-US",
										{ year: "numeric", month: "long", day: "numeric" },
									),
								};
								const html =
									result.emailKind === "approved"
										? applicationApprovedEmail(data, "/dashboard")
										: result.emailKind === "waitlisted"
											? applicationWaitlistedEmail(data)
											: applicationRejectedEmail(data);
								await sendMail({
									to: app.email,
									subject:
										result.emailKind === "approved"
											? `Approved (${app.reference}) | Unicorn Barber Training Academy`
											: result.emailKind === "waitlisted"
												? `Waitlisted (${app.reference}) | Unicorn Barber Training Academy`
												: `Update on your application (${app.reference})`,
									html,
								});
							}
						} catch (error) {
							console.error("[enrollments] decision email failed:", error);
						}
					}

					return json({
						ok: true,
						userRoleUpgraded: result.userRoleUpgraded,
					});
				}

				return json({ message: "Unknown action" }, { status: 400 });
			},
		},
	},
});
