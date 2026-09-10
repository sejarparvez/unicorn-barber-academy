import { useRouterState } from "@tanstack/react-router";
import { m, useReducedMotion } from "motion/react";

export function RouteProgress() {
	const isLoading = useRouterState({
		select: (s) => s.status === "pending",
	});
	const shouldReduceMotion = useReducedMotion();

	if (!isLoading) return null;

	return (
		<m.div
			className="fixed inset-x-0 top-0 z-[100] h-0.5 bg-primary"
			initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0, originX: 0 }}
			animate={
				shouldReduceMotion
					? { opacity: 1 }
					: { scaleX: [0, 0.7, 0.85, 0.95], originX: 0 }
			}
			transition={
				shouldReduceMotion
					? { duration: 0 }
					: { duration: 1.5, ease: "easeOut" }
			}
		/>
	);
}
