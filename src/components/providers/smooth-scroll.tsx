// src/components/providers/smooth-scroll.tsx
// Lenis smooth scrolling for the marketing pages. Skips entirely when the
// user prefers reduced motion, and stays off app surfaces (dashboard, auth,
// certificate print) where native scroll behavior is expected.
//
// Anchor links (`#main-content` skip link) still work: Lenis intercepts
// wheel/touch input, not hash navigation — the browser jumps as usual.

import { useRouterState } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { useEffect } from "react";

export function SmoothScroll() {
	const shouldReduceMotion = useReducedMotion();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isMarketing =
		!pathname.startsWith("/dashboard") &&
		!pathname.startsWith("/auth") &&
		!pathname.startsWith("/verify") &&
		!pathname.includes("/print");

	useEffect(() => {
		if (shouldReduceMotion || !isMarketing) return;

		// Dynamic import keeps lenis (~18 KB) out of the initial bundle.
		// Smoothing engages a fraction after mount — imperceptible, since
		// no meaningful scroll can happen before hydration anyway.
		let lenis: { destroy: () => void } | undefined;
		let cancelled = false;
		void import("lenis").then(({ default: Lenis }) => {
			if (cancelled) return;
			lenis = new Lenis({
				// Gentle, premium feel — not floaty.
				duration: 1.1,
				easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
				touchMultiplier: 1.4,
				// Drive the raf loop internally only while settling — avoids a
				// permanent per-frame callback (and its layout reads) when idle.
				autoRaf: true,
			});
		});

		return () => {
			cancelled = true;
			lenis?.destroy();
		};
	}, [shouldReduceMotion, isMarketing]);

	// Marketing-only means nothing renders; this is a pure side-effect hook.
	return null;
}
