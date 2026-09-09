// src/lib/site-context.ts
// Shared access to academy site settings loaded once in the root loader.
// Components read contact/areas/announcement from here instead of importing
// data/site.ts CONTACT directly, so admin edits propagate everywhere
// (visible UI + JSON-LD share the same resolved object — no drift).
import { getRouteApi } from "@tanstack/react-router";
import type { ResolvedSettings } from "@/lib/settings";

const rootApi = getRouteApi("__root__");

export function useSite(): ResolvedSettings {
	return rootApi.useLoaderData().site;
}
