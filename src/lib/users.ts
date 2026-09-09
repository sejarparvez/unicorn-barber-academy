// src/lib/users.ts
// Client-safe user-management domain types crossing the server/client
// boundary (same contract style as lib/enrollment.ts / lib/roles.ts).
import type { Role } from "@/lib/roles";

export type AdminUserRow = {
	id: number;
	name: string | null;
	email: string;
	emailVerified: boolean;
	role: Role;
	banned: boolean;
	banReason: string | null;
	banExpires: string | null;
	createdAt: string;
};

export type ListUsersResult = {
	items: AdminUserRow[];
	total: number;
	page: number;
	totalPages: number;
};
