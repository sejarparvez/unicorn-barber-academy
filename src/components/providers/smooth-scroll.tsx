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

		// Touch devices keep native scroll: Lenis intercepts touch input and
		// forces layout reads on every frame (PageSpeed "forced reflow"),
		// and native momentum scrolling already feels right on mobile.
		// This also keeps the ~18 KB lenis chunk off mobile entirely.
		if (window.matchMedia("(pointer: coarse)").matches) return;

		// Dynamic import keeps lenis out of the initial bundle; idle-defer
		// keeps its evaluation + first layout reads off the critical path.
		// Smoothing engages shortly after load — imperceptible, since no
		// meaningful scroll can happen before hydration anyway.
		let lenis: { destroy: () => void } | undefined;
		let cancelled = false;
		let idleId: number | undefined;
		let fallbackId = 0;
		const init = () => {
			if (cancelled || lenis) return;
			cleanup();
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
		};
		const cleanup = () => {
			window.removeEventListener("scroll", init);
			if (idleId !== undefined) window.cancelIdleCallback(idleId);
			window.clearTimeout(fallbackId);
		};
		window.addEventListener("scroll", init, { passive: true });
		if (typeof window.requestIdleCallback === "function") {
			idleId = window.requestIdleCallback(init, { timeout: 3000 });
		} else {
			fallbackId = window.setTimeout(init, 2000);
		}

		return () => {
			cancelled = true;
			cleanup();
			lenis?.destroy();
		};
	}, [shouldReduceMotion, isMarketing]);

	// Marketing-only means nothing renders; this is a pure side-effect hook.
	return null;
}
