// src/service/query-keys.ts
// Single source of truth for TanStack Query keys. Hierarchical on purpose:
// invalidating the parent key ("applications") clears every filtered list,
// while detail keys nest under the same scope.
//
// Usage:
//   queryClient.invalidateQueries({ queryKey: queryKeys.applications() })
//   queryClient.invalidateQueries({ queryKey: queryKeys.application(7) })
//
// Convention: [scope, ...params] — params objects last so partial matching
// by scope works cleanly.

export const queryKeys = {
	/* ------------------------------ enrollment ----------------------------- */
	applications: (filters?: {
		status?: string;
		search?: string;
		page?: number;
	}) => ["applications", filters ?? {}] as const,
	application: (id: number) => ["applications", "detail", id] as const,
	intakes: () => ["intakes"] as const,
	myApplications: () => ["my-applications"] as const,
	openIntakes: () => ["open-intakes"] as const,

	/* ----------------------------- certificates ----------------------------- */
	certificates: () => ["certificates"] as const,
	certificate: (id: number) => ["certificates", "detail", id] as const,
	applicationCertificate: (applicationId: number) =>
		["certificates", "application", applicationId] as const,

	/* -------------------------------- console ------------------------------- */
	consoleOverview: () => ["console-overview"] as const,

	/* -------------------------------- blog --------------------------------- */
	adminPosts: (filters?: { status?: string; page?: number }) =>
		["admin-posts", filters ?? {}] as const,
	adminPost: (id: number) => ["admin-posts", "detail", id] as const,
	blogCategories: () => ["blog-categories"] as const,
};
