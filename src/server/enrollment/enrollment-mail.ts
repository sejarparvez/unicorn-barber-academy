// src/server/enrollment/enrollment-mail.ts
// Decision emails shared by the single-application and bulk status routes.
// Delivery is best-effort: the admission state change is already committed,
// so a mail failure must never fail the request.
import { APP_ORIGIN } from "@/lib/env";
import { getApplicationDetail } from "@/server/enrollment/enrollment-db";
import {
	applicationApprovedEmail,
	applicationRejectedEmail,
	applicationWaitlistedEmail,
	sendMail,
} from "@/server/mail";

export type DecisionEmailKind = "approved" | "waitlisted" | "rejected";

const SUBJECTS: Record<DecisionEmailKind, (reference: string) => string> = {
	approved: (reference) =>
		`Approved (${reference}) | Unicorn Barber Training Academy`,
	waitlisted: (reference) =>
		`Waitlisted (${reference}) | Unicorn Barber Training Academy`,
	rejected: (reference) =>
		`Update on your application (${reference}) | Unicorn Barber Training Academy`,
};

/** Send the decision email for one application (non-fatal). */
export async function sendApplicationDecisionEmail(
	applicationId: number,
	kind: DecisionEmailKind,
): Promise<void> {
	try {
		const detail = await getApplicationDetail(applicationId);
		if (!detail) return;
		const app = detail.application;
		const data = {
			reference: app.reference,
			fullName: app.fullName,
			programTitle: app.programTitle,
			cohortLabel: app.cohort === "day" ? "Day cohort" : "Evening cohort",
			startsOnDisplay: new Date(app.startsOn).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		};
		const html =
			kind === "approved"
				? applicationApprovedEmail(data, `${APP_ORIGIN}/dashboard`)
				: kind === "waitlisted"
					? applicationWaitlistedEmail(data)
					: applicationRejectedEmail(data);
		await sendMail({
			to: app.email,
			subject: SUBJECTS[kind](app.reference),
			html,
		});
	} catch (error) {
		console.error(
			`[enrollments] ${kind} email failed for application #${applicationId}:`,
			error,
		);
	}
}
