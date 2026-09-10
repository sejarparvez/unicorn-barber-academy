// src/components/providers/motion-provider.tsx
// Lazy-loads framer-motion's DOM feature bundle (layout, exit, gestures)
// as a separate async chunk so the animation runtime doesn't inflate the
// initial JS payload or block LCP. All `motion.*` usages must be `m.*` for
// the split to work; `strict` enforces that in dev.
import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

// Dynamic import = Rollup emits the feature bundle as its own chunk,
// fetched after hydration instead of parsed during initial load.
const loadFeatures = () => import("motion/react").then((m) => m.domMax);

export function MotionProvider({ children }: { children: ReactNode }) {
	return (
		<LazyMotion features={loadFeatures} strict>
			{children}
		</LazyMotion>
	);
}
