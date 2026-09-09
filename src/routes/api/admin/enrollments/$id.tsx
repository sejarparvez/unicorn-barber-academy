// routes/api/admin/enrollments/$id.tsx
// PATCH /api/admin/enrollments/:id — admissions actions on one application.
// Body: { action: "status", status, note? } | { action: "fee", paid }
// Status transitions to a terminal decision trigger the applicant email
// (non-fatal on failure) — see updateApplicationStatus for DB side effects.
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { parseApplicationStatus, parseFeeMethod } from "@/lib/enrollment";
import { APP_ORIGIN } from "@/lib/env";
import { requireAdminApi } from "@/server/admin-api";
import { logAdminAction } from "@/server/audit-log";
import {
	deleteFeePayment,
	getApplicationDetail,
	recordFeePayment,
	updateApplicationStatus,
} from "@/server/enrollment-db";
import {
	applicationApprovedEmail,
	applicationRejectedEmail,
	applicationWaitlistedEmail,
	feePaymentConfirmedEmail,
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
					return json(
						{ message: "Fee toggle retired — record payments instead" },
						{ status: 410 },
					);
				}

				if (action === "record-payment") {
					const taka = Number.parseInt(String(body.amountTaka ?? ""), 10);
					const method = parseFeeMethod(
						typeof body.method === "string" ? body.method : "",
					);
					if (!Number.isInteger(taka) || taka < 1 || taka > 1_000_000) {
						return json(
							{ message: "Amount must be ৳1–৳1,000,000" },
							{ status: 400 },
						);
					}
					if (!method) {
						return json(
							{ message: "Method must be bKash, cash, or bank" },
							{ status: 400 },
						);
					}
					const receipt =
						typeof body.receipt === "string" && body.receipt.trim()
							? body.receipt.trim().slice(0, 120)
							: null;
					const result = await recordFeePayment({
						applicationId: id,
						amountPoisha: taka * 100,
						method,
						receiptRef: receipt,
						receivedBy: guard.userId,
						paidAt: null,
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
						summary: `Recorded ৳${taka.toLocaleString("en-US")} (${method}) for application #${id}`,
						metadata: { amountPoisha: taka * 100, method },
					});
					// Payment confirmation email when the ledger flips paid in full.
					try {
						const detail = await getApplicationDetail(id);
						if (detail && detail.application.feeStatus === "paid") {
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
						return json(
							{ message: "This status transition is not allowed" },
							{ status: 409 },
						);
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
										? applicationApprovedEmail(data, `${APP_ORIGIN}/dashboard`)
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

					await logAdminAction({
						actorId: guard.userId,
						action: "application.status",
						targetType: "application",
						targetId: id,
						summary: `Set application #${id} status to ${status}${result.userRoleUpgraded ? " (role upgraded to student)" : ""}`,
						metadata: { status, userRoleUpgraded: result.userRoleUpgraded },
					});
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
