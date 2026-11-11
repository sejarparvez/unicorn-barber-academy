import { Image } from '@unpic/react';
import { motion, useReducedMotion } from 'motion/react';
import banner from '@/assets/logo/banner.png';

export default function Brand() {
	const shouldReduceMotion = useReducedMotion();
	return (
		<section
			className="relative overflow-hidden bg-background px-6 py-14 lg:px-10 lg:py-16"
			aria-label="Unicorn Barber Training Academy"
		>
			<div className="mx-auto max-w-4xl text-center">
				<motion.div
					initial={shouldReduceMotion ? {} : { scale: 0.96 }}
					whileInView={{ scale: 1 }}
					viewport={{ once: true, margin: '-80px' }}
					transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
				>
					<Image
						src={banner}
						layout="constrained"
						width={768}
						height={384}
						alt="Unicorn Barber Training Academy"
						className="mx-auto h-auto w-full max-w-4xl"
						loading="lazy"
						decoding="async"
					/>
				</motion.div>

				<div
					aria-hidden="true"
					className="mx-auto mt-8 h-px w-24 bg-linear-to-r from-transparent via-primary to-transparent"
				/>
			</div>
		</section>
	);
}
