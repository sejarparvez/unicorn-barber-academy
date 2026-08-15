/* ----------------------------- Stats ----------------------------- */

import { cn } from "#/lib/utils";

const STATS = [
	{ value: "1,200+", label: "Graduates Placed" },
	{ value: "97%", label: "Job Placement Rate" },
	{ value: "12", label: "Years Training Barbers & Beauticians" },
	{ value: "60+", label: "Partner Salons & Barbershops" },
];

export default function Stats() {
	return (
		<section
			className="bg-secondary text-secondary-foreground"
			aria-label="Academy statistics"
		>
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
							{stat.value}
						</span>
						<span className="text-[11px] tracking-[0.2em] text-secondary-foreground/55">
							{stat.label.toUpperCase()}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
