// src/server/program-utils.ts
// Shared server-only helpers for resolving program metadata from the catalog.
import { ALL_PROGRAMS } from "@/data/programs";

/** Look up a program title by its slug. Returns null for unknown slugs. */
export function programTitle(slug: string): string | null {
	return ALL_PROGRAMS.find((p) => p.slug === slug)?.title ?? null;
}
