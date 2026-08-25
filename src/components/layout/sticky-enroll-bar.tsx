// src/components/layout/sticky-enroll-bar.tsx
// Mobile-only conversion bar: appears after the hero scrolls away, hides
// near the footer so it never covers the final CTA. Desktop is unaffected —
// the header already carries a persistent Enroll button there.
import { IconArrowRight } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export function StickyEnrollBar() {
	const shouldReduceMotion = useReducedMotion();
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => {
			const past = window.scrollY > window.innerHeight * 0.7;
			const nearBottom =
				window.scrollY + window.innerHeight >
				document.documentElement.scrollHeight - 600;
			setVisible(past && !nearBottom);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<AnimatePresence>
			{visible ? (
				<motion.div
					initial={shouldReduceMotion ? false : { y: 80 }}
					animate={{ y: 0 }}
					exit={{ y: 80 }}
					transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
					className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/30 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85 sm:hidden print:hidden"
				>
					<Link
						to="/enroll"
						className="flex items-center justify-between gap-3 px-4 py-3"
					>
						<span className="flex flex-col leading-tight">
							<span className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">
								Enrollment open
							</span>
							<span className="text-[13px] text-foreground/85">
								Fall cohort — limited seats
							</span>
						</span>
						<span className="inline-flex items-center gap-1.5 rounded-none bg-primary px-4 py-2.5 text-[11px] font-semibold tracking-[0.14em] text-primary-foreground">
							ENROLL
							<IconArrowRight className="h-3.5 w-3.5" stroke={2} />
						</span>
					</Link>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
