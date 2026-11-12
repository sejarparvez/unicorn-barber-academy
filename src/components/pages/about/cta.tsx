import {
	IconArrowRight,
	IconClock,
	IconMapPin,
	IconPhone,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import logo from '@/assets/logo/logo.png';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';

const CONTACT_LINK: { label: string; to: string } = {
	label: 'Talk to admissions',
	to: '/contact',
};

const CONTACT_ITEMS = [
	{
		icon: IconMapPin,
		label: SITE.contact.address,
	},
	{
		icon: IconClock,
		label: `${SITE.contact.hours.days} · ${SITE.contact.hours.time}`,
	},
];

export default function AboutCta() {
	return (
		<section
			aria-labelledby="about-cta-heading"
			className="section-light relative overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
		>
			<div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-primary/25 bg-card px-6 py-9 shadow-sm sm:px-10 lg:px-12 lg:py-12">
				{/* Warm gold haze + faint blueprint grid */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
				>
					<div className="absolute inset-0 bg-primary/[0.03]" />
					<div className="absolute -top-24 left-1/3 size-[22rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
					<div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] opacity-[0.07] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
				</div>

				{/* Watermark crest */}
				<Image
					src={logo}
					layout="constrained"
					width={550}
					height={454}
					alt=""
					aria-hidden="true"
					className="pointer-events-none absolute -right-8 -bottom-12 hidden h-auto w-56 opacity-[0.06] sm:block"
					loading="lazy"
				/>

				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent"
				/>

				<div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
					<div>
						<p className="font-semibold text-[11px] text-primary uppercase tracking-[0.3em]">
							Enrollment open — Fall cohort
						</p>
						<h2
							id="about-cta-heading"
							className="mt-3 text-balance font-bold text-3xl text-foreground leading-[1.05] tracking-tight sm:text-4xl"
						>
							Ready to earn your <span className="text-primary">chair</span>?
						</h2>
						<p className="mt-3 max-w-xl text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
							Come see the floor, meet an instructor and try a pair of clippers
							before you commit. If it feels right, we will help you pick the
							program and the cohort that fits your life.
						</p>

						<div className="mt-7 flex flex-col gap-3 sm:flex-row">
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

					{/* Contact strip */}
					<div className="relative rounded-xl border border-border/70 bg-background/50 p-5">
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							Visit the academy
						</p>

						<ul className="mt-4 space-y-3.5">
							{CONTACT_ITEMS.map((item) => (
								<li
									key={item.label}
									className="flex items-start gap-3 text-secondary-foreground/80 text-sm leading-relaxed"
								>
									<item.icon
										className="mt-0.5 size-4 shrink-0 text-primary/80"
										stroke={1.75}
										aria-hidden="true"
									/>
									{item.label}
								</li>
							))}
							<li>
								<a
									href={`tel:${SITE.contact.phoneE164}`}
									className="flex items-center gap-3 text-secondary-foreground/80 text-sm transition-colors hover:text-primary"
								>
									<IconPhone
										className="size-4 shrink-0 text-primary/80"
										stroke={1.75}
										aria-hidden="true"
									/>
									{SITE.contact.phone}
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</section>
	);
}
