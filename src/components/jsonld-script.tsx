import { stringifyJsonLd } from "@/lib/jsonld";

export function JsonLdScript({ data }: { data: unknown }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: stringifyJsonLd escapes <, >, and line separators
			dangerouslySetInnerHTML={{ __html: stringifyJsonLd(data) }}
		/>
	);
}
