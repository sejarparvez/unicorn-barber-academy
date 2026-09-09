// src/server/inquiry-db.ts
// Server-only data access for the contact inbox. Public submissions insert;
// admin triages read/replied and deletes spam. Email notification stays as
// the alert channel — this table is the durable backup + workflow.
import type { InquiryListResult, InquiryRow } from "@/lib/inquiry";
import { db } from "../db";

const PAGE_SIZE = 20;

function toRow(row: {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	subject: string;
	program: string | null;
	message: string;
	is_read: boolean;
	is_replied: boolean;
	created_at: Date;
}): InquiryRow {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		phone: row.phone,
		subject: row.subject,
		program: row.program,
		message: row.message,
		isRead: row.is_read,
		isReplied: row.is_replied,
		createdAt: new Date(row.created_at).toISOString(),
	};
}

export async function saveInquiry(input: {
	name: string;
	email: string;
	phone: string | null;
	subject: string;
	program: string | null;
	message: string;
}): Promise<number | null> {
	try {
		const res = await db().query<{ id: number }>(
			`INSERT INTO contact_inquiry (name, email, phone, subject, program, message)
			 VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
			[
				input.name,
				input.email,
				input.phone,
				input.subject,
				input.program,
				input.message,
			],
		);
		return res.rows[0]?.id ?? null;
	} catch (error) {
		// Storage must never break the public form — the email path already ran.
		console.error("[inquiry] failed to store inquiry:", error);
		return null;
	}
}

export async function listInquiriesAdmin(options: {
	unreadOnly?: boolean;
	page?: number;
}): Promise<InquiryListResult> {
	const page = Math.max(1, options.page ?? 1);
	const where = options.unreadOnly ? "WHERE is_read = FALSE" : "";
	const totalRes = await db().query<{ count: string }>(
		`SELECT count(*) AS count FROM contact_inquiry ${where}`,
	);
	const unreadRes = await db().query<{ count: string }>(
		`SELECT count(*) AS count FROM contact_inquiry WHERE is_read = FALSE`,
	);
	const total = Number.parseInt(totalRes.rows[0]?.count ?? "0", 10);
	const res = await db().query<{
		id: number;
		name: string;
		email: string;
		phone: string | null;
		subject: string;
		program: string | null;
		message: string;
		is_read: boolean;
		is_replied: boolean;
		created_at: Date;
	}>(
		`SELECT id, name, email, phone, subject, program, message,
			is_read, is_replied, created_at
		 FROM contact_inquiry ${where}
		 ORDER BY created_at DESC, id DESC
		 LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`,
	);
	return {
		items: res.rows.map(toRow),
		total,
		unread: Number.parseInt(unreadRes.rows[0]?.count ?? "0", 10),
		page,
		totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
	};
}

export async function markInquiry(
	id: number,
	patch: { isRead?: boolean; isReplied?: boolean },
): Promise<boolean> {
	const sets: string[] = [];
	const params: unknown[] = [];
	if (patch.isRead !== undefined) {
		params.push(patch.isRead);
		sets.push(`is_read = $${params.length + 1}`);
	}
	if (patch.isReplied !== undefined) {
		params.push(patch.isReplied);
		sets.push(`is_replied = $${params.length + 1}`);
	}
	if (sets.length === 0) return true;
	params.unshift(id);
	const res = await db().query(
		`UPDATE contact_inquiry SET ${sets.join(", ")} WHERE id = $1`,
		params,
	);
	return (res.rowCount ?? 0) > 0;
}

export async function deleteInquiry(id: number): Promise<boolean> {
	const res = await db().query("DELETE FROM contact_inquiry WHERE id = $1", [
		id,
	]);
	return (res.rowCount ?? 0) > 0;
}
