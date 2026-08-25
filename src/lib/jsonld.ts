/**
 * Safely serialize structured data for embedding in a
 * `<script type="application/ld+json">` tag.
 *
 * Plain `JSON.stringify` does not escape `<`, so user-controlled strings
 * containing `</script>` can break out of the tag and inject HTML.
 */
export function stringifyJsonLd(data: unknown): string {
	return JSON.stringify(data)
		.replaceAll("<", "\\u003c")
		.replaceAll(">", "\\u003e")
		.replaceAll("\u2028", "\\u2028")
		.replaceAll("\u2029", "\\u2029");
}
