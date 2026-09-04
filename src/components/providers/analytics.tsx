// src/components/providers/analytics.tsx
// Consent-light analytics hook point. Renders nothing until
// VITE_PLAUSIBLE_DOMAIN is set — the privacy page promises "anonymised,
// cookie-free analytics", which is exactly Plausible's model. Swap the
// script src for another provider if you migrate.
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

/** Track a Plausible custom event. No-op when analytics is disabled. */
export function trackEvent(name: string, props?: Record<string, string>) {
	const w = globalThis as unknown as Record<string, unknown>;
	if (typeof w.plausible === "function") {
		(
			w.plausible as (
				name: string,
				opts: { props?: Record<string, string> },
			) => void
		)(name, { props });
	}
}

export function Analytics() {
	const domain = (
		import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined
	)?.trim();
	if (!domain) return null;
	return <AnalyticsInner domain={domain} />;
}

function AnalyticsInner({ domain }: { domain: string }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const prevPathname = useRef(pathname);

	useEffect(() => {
		if (prevPathname.current !== pathname) {
			trackEvent("pageview");
			prevPathname.current = pathname;
		}
	}, [pathname]);

	return (
		<script
			defer
			data-domain={domain}
			src="https://plausible.io/js/script.js"
		/>
	);
}
