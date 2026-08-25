// src/components/providers/analytics.tsx
// Consent-light analytics hook point. Renders nothing until
// VITE_PLAUSIBLE_DOMAIN is set — the privacy page promises "anonymised,
// cookie-free analytics", which is exactly Plausible's model. Swap the
// script src for another provider if you migrate.
export function Analytics() {
	const domain = (
		import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined
	)?.trim();
	if (!domain) return null;
	return (
		<script
			defer
			data-domain={domain}
			src="https://plausible.io/js/script.js"
		/>
	);
}
