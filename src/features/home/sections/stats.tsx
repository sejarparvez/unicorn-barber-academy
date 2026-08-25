/* ----------------------------- Stats ----------------------------- */

import {
	type MotionValue,
	motion,
	type Transition,
	useInView,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const STATS = [
	{ value: 1200, suffix: "+", label: "Graduates Placed" },
	{ value: 97, suffix: "%", label: "Job Placement Rate" },
	{ value: 12, suffix: "", label: "Years Training Barbers & Beauticians" },
	{ value: 60, suffix: "+", label: "Partner Salons & Barbershops" },
];

const SPRING: Transition = { duration: 1.8, ease: [0.16, 1, 0.3, 1] };

/** Animates a number from 0 to `value` the first time it scrolls into view. */
function CountUp({
	value,
	progress,
}: {
	value: number;
	progress: MotionValue<number>;
}) {
	const text = useTransform(progress, (latest) =>
		Math.round(latest * value).toLocaleString("en-US"),
	);
	return <motion.span>{text}</motion.span>;
}

export default function Stats() {
	const ref = useRef<HTMLElement>(null);
	const inView = useInView(ref, { once: true, margin: "-60px" });
	const shouldReduceMotion = useReducedMotion();
	const spring = useSpring(0, SPRING);

	useEffect(() => {
		if (inView) spring.set(1);
	}, [inView, spring]);

	return (
		<section ref={ref} aria-label="Academy statistics">
			<div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 lg:px-10">
				{STATS.map((stat, i) => (
					<div
						key={stat.label}
						className={cn(
							"flex flex-col items-center gap-2 border-primary/15 px-6 py-12 text-center",
							i % 2 === 0 ? "border-r" : "",
							i < 2 ? "border-b lg:border-b-0" : "",
							i > 0 && "lg:border-l",
						)}
					>
						<span
							className="bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-4xl text-transparent sm:text-5xl"
							style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
						>
							{shouldReduceMotion || !inView
								? stat.value.toLocaleString("en-US")
								: null}
							{shouldReduceMotion || !inView ? stat.suffix : null}
							{inView && !shouldReduceMotion ? (
								<>
									<CountUp value={stat.value} progress={spring} />
									{stat.suffix}
								</>
							) : null}
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
