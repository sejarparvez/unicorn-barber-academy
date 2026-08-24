// src/data/media.ts
// Press & media coverage: TV appearances, newspaper features, interviews.
// Static curated content (same pattern as programs/instructors) — add an
// entry per story; newest first renders at the top.
//
// Entry shape:
//   {
//     title: "How Unicorn Barber Academy is professionalising barbering",
//     outlet: "The Daily Star",
//     url: "https://www.thedailystar.net/...",
//     publishedOn: "2026-06-14",
//     type: "newspaper",
//     summary: "Feature on our NTVQF-aligned curriculum and job outcomes.",
//   }
//
// Leave MEDIA_FEATURES empty until real coverage exists — /media renders a
// graceful coming-soon state rather than fake press.

export const MEDIA_TYPES = [
	"tv",
	"newspaper",
	"online",
	"youtube",
	"podcast",
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
	tv: "TV appearance",
	newspaper: "Newspaper",
	online: "Online feature",
	youtube: "YouTube",
	podcast: "Podcast",
};

export type MediaFeature = {
	title: string;
	/** Publication or channel name, e.g. "Somoy TV". */
	outlet: string;
	/** Canonical URL of the story/video. */
	url: string;
	/** yyyy-mm-dd */
	publishedOn: string;
	type: MediaType;
	/** One or two sentences on what the story covers. */
	summary?: string;
};

export const MEDIA_FEATURES: MediaFeature[] = [];
