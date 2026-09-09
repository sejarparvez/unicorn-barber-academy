/* ----------------------------- Stats ----------------------------- */

import {
	animate,
	useInView,
	useMotionValue,
	useMotionValueEvent,
	useReducedMotion,
	useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "@/lib/site-context";
import { cn } from "@/lib/utils";

/** Animates a number from 0 to `value` once `start` becomes true. */
function CountUp({
	value,
	start,
	delay = 0,
}: {
	value: number;
	start: boolean;
	delay?: number;
}) {
	const mv = useMotionValue(0);
	const rounded = useTransform(mv, (latest) =>
		Math.round(latest).toLocaleString("en-US"),
	);
	const [display, setDisplay] = useState("0");
	useMotionValueEvent(rounded, "change", (latest) => setDisplay(latest));

	useEffect(() => {
		if (!start) return;
		const controls = animate(mv, value, {
			duration: 1.8,
			delay,
			ease: [0.16, 1, 0.3, 1],
		});
		return () => controls.stop();
	}, [start, value, delay, mv]);

	return <span className="tabular-nums">{display}</span>;
}

export default function Stats() {
	const { stats } = useSite();
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.3 });
	const shouldReduceMotion = useReducedMotion();

	return (
		<section ref={ref} aria-label="Academy statistics">
			<div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 lg:px-10">
				{stats.map((stat, i) => (
					<div
						key={stat.label}
						className={cn(
							"flex flex-col items-center gap-2 border-primary/15 px-4 py-12 text-center",
							i % 2 === 0 ? "border-r" : "",
							i < 2 ? "border-b lg:border-b-0" : "",
							i > 0 && "lg:border-l",
						)}
					>
						<span
							className="bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-4xl text-transparent sm:text-5xl"
							style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
						>
							{shouldReduceMotion || !inView ? (
								<span className="tabular-nums">
									{stat.value.toLocaleString("en-US")}
									{stat.suffix}
								</span>
							) : (
								<>
									<CountUp value={stat.value} start={inView} delay={i * 0.12} />
									{stat.suffix}
								</>
							)}
						</span>
						<span className="text-[11px] tracking-[0.2em] text-secondary-foreground/70">
							{stat.label.toUpperCase()}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
