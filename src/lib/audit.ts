// src/lib/audit.ts
// Client-safe audit-log domain types (same contract style as lib/users.ts).
export type AuditAction =
	| "user.role"
	| "user.ban"
	| "user.unban"
	| "program.update"
	| "settings.update"
	| "intake.create"
	| "intake.update"
	| "intake.delete"
	| "application.status"
	| "application.bulk-status"
	| "application.fee"
	| "certificate.issue"
	| "certificate.revoke"
	| "instructor.create"
	| "instructor.update"
	| "instructor.delete"
	| "gallery.create"
	| "gallery.update"
	| "gallery.delete"
	| "testimonial.create"
	| "testimonial.update"
	| "testimonial.delete";

export type AuditEntry = {
	id: number;
	actorId: number;
	actorEmail: string | null;
	actorName: string | null;
	action: string;
	targetType: string;
	targetId: string;
	summary: string;
	/** JSON-encoded metadata (kept as text for RPC serialization). */
	metadata: string;
	createdAt: string;
};

export type AuditListResult = {
	items: AuditEntry[];
	total: number;
	page: number;
	totalPages: number;
};
