import {
	IconArrowRight,
	IconArrowUpRight,
	IconClock,
	IconMail,
	IconMapPin,
	IconPhone,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import logo from '@/assets/logo/logo.png';
import { buttonVariants } from '@/components/ui/button';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.contact.address)}`;

type ContactItem = {
	icon: typeof IconMapPin;
	label: string;
	href?: string;
	external?: boolean;
};

const CONTACT_ITEMS: ContactItem[] = [
	{
		icon: IconMapPin,
		label: SITE.contact.address,
		href: MAPS_URL,
		external: true,
	},
	{
		icon: IconClock,
		label: `${SITE.contact.hours.days} · ${SITE.contact.hours.time}`,
	},
	{
		icon: IconPhone,
		label: SITE.contact.phone,
		href: `tel:${SITE.contact.phoneE164}`,
	},
	{
		icon: IconMail,
		label: SITE.contact.email,
		href: `mailto:${SITE.contact.email}`,
	},
];

export default function ContactCta() {
	return (
		<section
			aria-labelledby="contact-cta-heading"
			className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 lg:px-10 lg:py-20"
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
							Visit the academy
						</p>
						<h2
							id="contact-cta-heading"
							className="mt-3 text-balance font-bold text-3xl text-foreground leading-[1.05] tracking-tight sm:text-4xl"
						>
							See the floor before you{' '}
							<span className="text-primary">decide</span>.
						</h2>
						<p className="mt-3 max-w-xl text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
							Walk through the studio, watch a live class and ask the questions
							that matter. If the fit feels right, we will help you pick a
							program and a cohort that works with your schedule.
						</p>

						<div className="mt-7 flex flex-col gap-3 sm:flex-row">
							<a
								href={`tel:${SITE.contact.phoneE164}`}
								className={cn(
									buttonVariants({ size: 'lg' }),
									'glow-gold h-11 justify-center gap-2 px-6 font-semibold text-[12px] tracking-[0.16em]',
								)}
							>
								CALL ADMISSIONS
								<IconPhone className="size-4" stroke={1.75} />
							</a>
							<a
								href={MAPS_URL}
								target="_blank"
								rel="noreferrer"
								className={cn(
									buttonVariants({ variant: 'outline', size: 'lg' }),
									'h-11 justify-center gap-2 border-primary/30 px-6 font-semibold text-[12px] text-primary tracking-[0.16em] hover:bg-primary/10 hover:text-primary',
								)}
							>
								GET DIRECTIONS
								<IconArrowUpRight className="size-4" stroke={1.75} />
							</a>
						</div>

						<Link
							to="/programs"
							className="group mt-5 inline-flex items-center gap-1.5 font-semibold text-[11px] text-foreground/70 uppercase tracking-[0.16em] transition-colors hover:text-primary"
						>
							Compare programs first
							<IconArrowRight
								className="size-3.5 transition-transform group-hover:translate-x-0.5"
								stroke={1.75}
							/>
						</Link>
					</div>

					{/* Contact strip */}
					<div className="relative rounded-xl border border-border/70 bg-background/50 p-5">
						<p className="font-semibold text-[10px] text-primary uppercase tracking-[0.24em]">
							Academy details
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
									{item.href ? (
										<a
											href={item.href}
											target={item.external ? '_blank' : undefined}
											rel={item.external ? 'noreferrer' : undefined}
											className="transition-colors hover:text-primary"
										>
											{item.label}
										</a>
									) : (
										item.label
									)}
								</li>
							))}
						</ul>

						<p className="mt-4 border-border/60 border-t pt-3 text-muted-foreground text-xs leading-relaxed">
							Call ahead and we will tell you which class is on the floor.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
