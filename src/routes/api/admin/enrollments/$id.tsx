// routes/api/admin/enrollments/$id.tsx
// PATCH /api/admin/enrollments/:id — admissions actions on one application.
// Body: { action: "status", status, note? } | { action: "fee", paid }
// Status transitions to a terminal decision trigger the applicant email
// (non-fatal on failure) — see updateApplicationStatus for DB side effects.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseApplicationStatus } from "@/lib/enrollment";
import { requireAdminApi } from "@/server/admin-api";
import { logAdminAction } from "@/server/audit/audit-log";
import {
	deleteFeePayment,
	getApplicationDetail,
	recordFeePayment,
	updateApplicationStatus,
} from "@/server/enrollment/enrollment-db";
import { sendApplicationDecisionEmail } from "@/server/enrollment/enrollment-mail";
import { parseFeePaymentPayload } from "@/server/enrollment/enrollment-validate";
import { feePaymentConfirmedEmail, sendMail } from "@/server/mail";

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
					return json(
						{ message: "Fee toggle retired — record payments instead" },
						{ status: 410 },
					);
				}

				if (action === "record-payment") {
					const parsed = parseFeePaymentPayload(body);
					if (!parsed.ok) {
						return json({ message: parsed.message }, { status: 400 });
					}
					const result = await recordFeePayment({
						applicationId: id,
						...parsed.value,
						receivedBy: guard.userId,
					});
					if (!result.ok) {
						return json(
							{
								message:
									result.reason === "not-found"
										? "Application not found"
										: "Invalid payment",
							},
							{ status: result.reason === "not-found" ? 404 : 400 },
						);
					}
					await logAdminAction({
						actorId: guard.userId,
						action: "application.fee",
						targetType: "application",
						targetId: id,
						summary: `Recorded ৳${(parsed.value.amountPoisha / 100).toLocaleString("en-US")} (${parsed.value.method}) for application #${id}`,
						metadata: {
							amountPoisha: parsed.value.amountPoisha,
							method: parsed.value.method,
						},
					});
					// Payment confirmation email only when the ledger transitions
					// unpaid → paid, not on every additional payment.
					try {
						const detail = await getApplicationDetail(id);
						if (
							detail &&
							result.previousFeeStatus !== "paid" &&
							result.feeStatus === "paid"
						) {
							const app = detail.application;
							await sendMail({
								to: app.email,
								subject: `Payment confirmed (${app.reference}) | Unicorn Barber Training Academy`,
								html: feePaymentConfirmedEmail({
									reference: app.reference,
									fullName: app.fullName,
									programTitle: app.programTitle,
									cohortLabel:
										app.cohort === "day" ? "Day cohort" : "Evening cohort",
									startsOnDisplay: new Date(app.startsOn).toLocaleDateString(
										"en-US",
										{
											year: "numeric",
											month: "long",
											day: "numeric",
										},
									),
								}),
							});
						}
					} catch (error) {
						console.error(
							"[enrollments] fee confirmation email failed:",
							error,
						);
					}
					return json({ ok: true });
				}

				if (action === "void-payment") {
					const paymentId = Number.parseInt(String(body.paymentId ?? ""), 10);
					if (!Number.isInteger(paymentId) || paymentId < 1) {
						return json({ message: "Invalid payment id" }, { status: 400 });
					}
					const deleted = await deleteFeePayment(id, paymentId);
					if (!deleted) {
						return json({ message: "Payment not found" }, { status: 404 });
					}
					await logAdminAction({
						actorId: guard.userId,
						action: "application.fee",
						targetType: "application",
						targetId: id,
						summary: `Voided payment #${paymentId} on application #${id}`,
						metadata: { voidedPaymentId: paymentId },
					});
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
						if (result.reason === "not-found") {
							return json(
								{ message: "Application not found" },
								{ status: 404 },
							);
						}
						if (result.reason === "intake-full") {
							return json(
								{
									message:
										"This intake is already full — reject or waitlist another applicant first",
								},
								{ status: 409 },
							);
						}
						return json(
							{ message: "This status transition is not allowed" },
							{ status: 409 },
						);
					}

					// Decision emails — non-fatal; admission state already committed.
					if (result.emailKind) {
						await sendApplicationDecisionEmail(id, result.emailKind);
					}

					const roleNote = result.userRoleUpgraded
						? " (role upgraded to student)"
						: result.userRoleDowngraded
							? " (role downgraded to user)"
							: "";
					await logAdminAction({
						actorId: guard.userId,
						action: "application.status",
						targetType: "application",
						targetId: id,
						summary: `Set application #${id} status to ${status}${roleNote}`,
						metadata: {
							status,
							userRoleUpgraded: result.userRoleUpgraded,
							userRoleDowngraded: result.userRoleDowngraded,
						},
					});
					return json({
						ok: true,
						userRoleUpgraded: result.userRoleUpgraded,
						userRoleDowngraded: result.userRoleDowngraded,
					});
				}

				return json({ message: "Unknown action" }, { status: 400 });
			},
		},
	},
});
