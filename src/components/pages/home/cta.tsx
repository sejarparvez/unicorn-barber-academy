import { IconArrowRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

const CONTACT_LINK = { label: 'Talk to admissions', to: '/contact' };

export default function Cta() {
	return (
		<section
			aria-labelledby="cta-heading"
			className="relative overflow-hidden bg-background px-4 py-16 lg:px-10 lg:py-20"
		>
			<div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-primary/25 bg-card px-6 py-7 sm:px-8 lg:px-10">
				{/* Warm gold haze + faint blueprint grid */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
				>
					<div className="absolute inset-0 bg-primary/[0.03]" />
					<div className="absolute -top-24 left-1/3 size-[22rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.07] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
				</div>
				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
				/>

				<div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="max-w-2xl">
						<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
							Enrollment open — Fall cohort
						</p>
						<h2
							id="cta-heading"
							className="mt-2 text-balance font-bold text-2xl text-foreground leading-tight tracking-tight sm:text-3xl"
						>
							Your chair is <span className="text-primary">waiting</span>.
						</h2>
						<p className="mt-2 max-w-xl text-pretty text-muted-foreground text-sm leading-relaxed">
							Train with working barbers, leave with a recognised certificate,
							and step onto the shop floor with a kit already in your hands.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
						<Button
							nativeButton={false}
							size="lg"
							className="glow-gold h-11 gap-2 px-6 font-semibold text-[12px] tracking-[0.16em]"
							render={<Link to="/enroll" />}
						>
							ENROLL NOW
							<IconArrowRight className="size-4" stroke={1.75} />
						</Button>
						<Button
							nativeButton={false}
							variant="outline"
							size="lg"
							className="h-11 gap-2 border-primary/30 px-6 font-semibold text-[12px] text-primary tracking-[0.16em] hover:bg-primary/10 hover:text-primary"
							render={<Link to={CONTACT_LINK.to} />}
						>
							{CONTACT_LINK.label.toUpperCase()}
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}
