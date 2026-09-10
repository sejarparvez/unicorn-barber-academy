// src/components/providers/motion-provider.tsx
// Lazy-loads framer-motion's DOM feature bundle (layout, exit, gestures)
// as a separate async chunk so the animation runtime doesn't inflate the
// initial JS payload or block LCP. Loading is deferred until the browser
// is idle (or the user first scrolls/interacts), so the feature chunk
// never competes with critical resources. All `motion.*` usages must be
// `m.*` for the split to work; `strict` enforces that in dev.
import { type FeatureBundle, LazyMotion } from "motion/react";
import type { ReactNode } from "react";

// Deferred dynamic import = Rollup emits the feature bundle as its own
// chunk, fetched after hydration (idle or first interaction) instead of
// parsed during initial load. Before it resolves, `m.*` components render
// their children statically — no hidden states, no layout shift.
function loadFeatures() {
	return new Promise<FeatureBundle>((resolve) => {
		let settled = false;
		const load = () => {
			if (settled) return;
			settled = true;
			cleanup();
			void import("motion/react").then((m) => resolve(m.domMax));
		};
		const cleanup = () => {
			window.removeEventListener("scroll", load);
			window.removeEventListener("pointerdown", load);
			if (idleId !== undefined) {
				window.cancelIdleCallback(idleId);
			}
			window.clearTimeout(fallbackId);
		};
		let idleId: number | undefined;
		const fallbackId = window.setTimeout(load, 2500);
		// Interactions may need gesture/layout features immediately.
		window.addEventListener("scroll", load, { passive: true });
		window.addEventListener("pointerdown", load);
		if (typeof window.requestIdleCallback === "function") {
			idleId = window.requestIdleCallback(() => load(), { timeout: 2000 });
		}
	});
}

export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={loadFeatures} strict>
			{children}
		</LazyMotion>
	);
}
