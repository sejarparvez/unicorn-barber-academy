// src/lib/roles.ts
// Single source of truth for the academy's user roles. The value stored in
// the better-auth `user.role` column (see prisma/schema.prisma) is the plain
// string; this module is the typed contract every other file reads.
//
//   user       — registered account, not enrolled in any program (default)
//   student    — has at least one enrollment
//   instructor — teaching staff
//   admin      — management; the only role better-auth's admin() plugin
//                treats as an administrator (adminRoles in server/auth.ts)

export const ROLES = ["user", "student", "instructor", "admin"] as const;

export type Role = (typeof ROLES)[number];

/** Human-readable labels for UI display. */
export const ROLE_LABELS: Record<Role, string> = {
	user: "Member",
	student: "Student",
	instructor: "Instructor",
	admin: "Admin",
};

/** Narrow a free-text role (session payload, DB row) to the Role union. */
export function parseRole(role: string | null | undefined): Role | undefined {
	return ROLES.includes(role as Role) ? (role as Role) : undefined;
}

/** Management + teaching staff. */
export function isStaff(role: string | null | undefined): boolean {
	return role === "admin" || role === "instructor";
}

export function isAdmin(role: string | null | undefined): boolean {
	return role === "admin";
}
