// src/data/images.ts
// Local image resolution for every photo slot on the site.
//
// HOW PLACEHOLDERS WORK
// ---------------------
// pic("unicorn-program-classic", 800, 900) looks for a file named
// `unicorn-program-classic.jpg|jpeg|png|webp` in `src/assets/images/`.
// If it exists, that file is served (hashed/bundled by Vite). If not,
// the shared `_placeholder.jpg` fallback is served instead.
//
// HOW TO REPLACE WITH REAL PHOTOS
// -------------------------------
// Drop a real photo into `src/assets/images/` named exactly after the
// slot's seed — e.g. `unicorn-program-classic.jpg` — and it is picked up
// automatically on the next dev server start / build. No code changes.
// Every seed in use is listed in this repo via `pic(...)` call sites and
// the `seed` fields in data/gallery.ts.

const imageFiles: Record<string, string> | null = (() => {
	try {
		return import.meta.glob<string>("../assets/images/*.{jpg,jpeg,png,webp}", {
			eager: true,
			import: "default",
			query: "?url",
		});
	} catch {
		// Non-Vite runtimes (e.g. plain `bun scripts/*.ts`) don't implement
		// import.meta.glob. They transitively import data modules that call
		// pic(), but never render photos.
		return null;
	}
})();

/** Reserved shared fallback (underscore prefix = never a slot name). */
function fallback(): string {
	const url = Object.entries(imageFiles ?? {}).find(([path]) =>
		path.includes("/_placeholder."),
	)?.[1];
	if (!url) {
		throw new Error(
			"src/assets/images/_placeholder.jpg is missing — restore the shared placeholder image.",
		);
	}
	return url;
}

/**
 * Resolve a photo slot to a bundled asset URL.
 * `w`/`h` are kept for call-site compatibility with the old remote
 * placeholder service; layout sizing comes from CSS/`<Image>` props.
 */
export const pic = (seed: string, _w?: number, _h?: number): string => {
	if (!imageFiles) return "";
	const match = Object.entries(imageFiles).find(([path]) => {
		const file = path.split("/").pop() ?? "";
		const dot = file.lastIndexOf(".");
		return dot > 0 && file.slice(0, dot) === seed;
	});
	return match ? match[1] : fallback();
};
