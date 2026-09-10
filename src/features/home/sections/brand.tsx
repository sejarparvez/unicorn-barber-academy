import { motion, useReducedMotion } from "motion/react";
import banner from "@/assets/logo/banner.png";
import banner640 from "@/assets/logo/banner-640.webp";
import banner896 from "@/assets/logo/banner-896.webp";
import banner1344 from "@/assets/logo/banner-1344.webp";
import { Reveal } from "@/components/effects";

export default function Brand() {
	const shouldReduceMotion = useReducedMotion();
	return (
		<section
			className="relative overflow-hidden bg-background px-6 py-20 lg:px-10"
			aria-label="Unicorn Barber Training Academy"
		>
			<div className="mx-auto max-w-4xl text-center">
				<Reveal>
					<motion.div
						initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.96 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true, margin: "-80px" }}
						transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
					>
						<picture>
							<source
								type="image/webp"
								srcSet={`${banner640} 640w, ${banner896} 896w, ${banner1344} 1344w`}
								sizes="(max-width: 672px) 100vw, 672px"
							/>
							<img
								src={banner}
								alt="Unicorn Barber Training Academy"
								className="mx-auto h-auto w-full max-w-2xl"
								width={4001}
								height={2001}
								loading="eager"
								fetchPriority="high"
							/>
						</picture>
					</motion.div>
				</Reveal>
				<motion.div
					aria-hidden="true"
					className="mx-auto mt-8 h-px w-24 bg-linear-to-r from-transparent via-primary to-transparent"
					initial={shouldReduceMotion ? {} : { scaleX: 0 }}
					whileInView={{ scaleX: 1 }}
					viewport={{ once: true, margin: "-60px" }}
					transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
				/>
			</div>
		</section>
	);
}
