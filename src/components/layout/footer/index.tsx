import {
	IconBrandFacebook,
	IconBrandInstagram,
	IconBrandTiktok,
	IconBrandX,
	IconBrandYoutube,
	IconClock,
	IconMail,
	IconMapPin,
	IconPhone,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { Image } from '@unpic/react';
import type { ReactNode } from 'react';
import logo from '@/assets/logo/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SITE } from '@/lib/site';

type FooterLink = { label: string; to: string };

const PROGRAMS: FooterLink[] = [
	{ label: 'Classic Barbering', to: '/programs/classic-barbering' },
	{ label: 'Beard Sculpting', to: '/programs/beard-sculpting' },
	{ label: 'Fades & Tapers', to: '/programs/fades-and-tapers' },
	{
		label: 'Cosmetology Fundamentals',
		to: '/programs/cosmetology-fundamentals',
	},
	{
		label: 'Hair Styling & Colouring',
		to: '/programs/hair-styling-and-colouring',
	},
	{
		label: 'Bridal & Editorial Makeup',
		to: '/programs/bridal-and-editorial-makeup',
	},
];

const ACADEMY: FooterLink[] = [
	{ label: 'About Us', to: '/about' },
	{ label: 'Instructors', to: '/instructors' },
	{ label: 'Student Life', to: '/student-life' },
	{ label: 'Press & Media', to: '/media' },
	{ label: 'Careers', to: '/careers' },
	{ label: 'Verify Certificate', to: '/verify' },
];

const LEGAL_LINKS: FooterLink[] = [
	{ label: 'Privacy', to: '/privacy' },
	{ label: 'Terms', to: '/terms' },
];

export default function Footer() {
	return (
		<footer className="relative overflow-hidden">
			{/* Top gradient hairline, echoing the header divider */}
			<Separator
				aria-hidden="true"
				className="h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-70"
			/>

			{/* Faint watermark crest for texture */}
			<Image
				src={logo}
				layout="constrained"
				width={550}
				height={454}
				alt=""
				aria-hidden="true"
				className="pointer-events-none absolute -right-12 -bottom-16 h-auto w-64 opacity-[0.04]"
				loading="lazy"
			/>

			<div className="relative mx-w-8xl px-4 sm:px-6 py-16 lg:px-16 items-center">
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1px_1fr_1px_1fr_1px_1fr]">
					{/* Brand column */}
					<div>
						<Link
							to="/"
							className="flex shrink-0 items-center gap-2.5 sm:gap-4 min-w-0"
							aria-label="Unicorn Barber Training Academy, home"
						>
							<Image
								src={logo}
								layout="constrained"
								width={550}
								height={454}
								alt="Unicorn Barber Training Academy logo"
								className="h-8 w-auto shrink-0 sm:h-10"
								fetchPriority="high"
							/>
							<span className="h-7 w-px shrink-0 bg-linear-to-b from-chart-1 via-primary to-chart-4 sm:h-8" />
							<span className="flex flex-col min-w-0 leading-none">
								<span className="bg-[linear-gradient(90deg,var(--chart-1),var(--primary),var(--chart-4))] bg-clip-text text-base sm:text-xl tracking-[0.12em] sm:tracking-[0.14em] text-transparent truncate font-semibold">
									UNICORN
								</span>
								<span className="mt-1 text-[8px] sm:text-[10px] text-secondary-foreground/80 truncate">
									BARBER TRAINING ACADEMY
								</span>
							</span>
						</Link>

						<p className="mt-5 max-w-xs text-sm leading-relaxed text-secondary-foreground/80">
							Sharpening tomorrow&apos;s master barbers, one blade at a time.
							Hands-on training, taught by working professionals.
						</p>

						{/* Enrollment updates — WhatsApp-first capture, no backend yet */}
						<div className="mt-6 max-w-xs">
							<p className="text-[11px] font-medium tracking-[0.18em] text-secondary-foreground/80 uppercase">
								Cohort announcements
							</p>
							<form
								className="mt-3 flex gap-2"
								onSubmit={(event) => {
									event.preventDefault();
									window.open(
										`https://wa.me/${SITE.contact.whatsapp}`,
										'_blank',
										'noopener,noreferrer',
									);
								}}
							>
								<Input
									type="tel"
									inputMode="tel"
									required
									placeholder="WhatsApp number"
									aria-label="WhatsApp number for cohort announcements"
									className="h-10 rounded-none border-border bg-background/60 text-sm"
								/>
								<Button
									type="submit"
									variant="outline"
									className="h-10 shrink-0 rounded-none border-primary/40 px-4 text-[11px] font-semibold tracking-[0.14em] text-primary hover:bg-primary hover:text-primary-foreground"
								>
									JOIN
								</Button>
							</form>
						</div>

						<div className="mt-6 flex items-center gap-4">
							<SocialIcon href={SITE.socials.instagram} label="Instagram">
								<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
							</SocialIcon>

							<SocialIcon href={SITE.socials.facebook} label="Facebook">
								<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
							</SocialIcon>

							<SocialIcon href={SITE.socials.youtube} label="YouTube">
								<IconBrandYoutube className="h-4 w-4" stroke={1.75} />
							</SocialIcon>

							<SocialIcon href={SITE.socials.tiktok} label="TikTok">
								<IconBrandTiktok className="h-4 w-4" stroke={1.75} />
							</SocialIcon>

							<SocialIcon href={SITE.socials.x} label="X (Twitter)">
								<IconBrandX className="h-4 w-4" stroke={1.75} />
							</SocialIcon>
						</div>
					</div>

					<Separator
						orientation="vertical"
						aria-hidden="true"
						className="hidden bg-primary/15 lg:block"
					/>

					{/* Programs column */}
					<FooterColumn title="Programs" links={PROGRAMS} />

					<Separator
						orientation="vertical"
						aria-hidden="true"
						className="hidden bg-primary/15 lg:block"
					/>

					{/* Academy column */}
					<FooterColumn title="Academy" links={ACADEMY} />

					<Separator
						orientation="vertical"
						aria-hidden="true"
						className="hidden bg-primary/15 lg:block"
					/>

					{/* Contact column */}
					<div>
						<h3 className="text-[12px] font-semibold tracking-[0.24em] text-primary">
							GET IN TOUCH
						</h3>
						<address className="mt-5 space-y-4 text-sm not-italic text-secondary-foreground/70">
							<p className="flex items-start gap-3">
								<IconMapPin
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<span>{SITE.contact.address}</span>
							</p>
							<p className="flex items-start gap-3">
								<IconPhone
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a
									href={`tel:${SITE.contact.phoneE164}`}
									className="hover:text-primary"
								>
									{SITE.contact.phone}
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconMail
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a
									href={`mailto:${SITE.contact.email}`}
									className="break-all hover:text-primary"
								>
									{SITE.contact.email}
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconClock
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<span>
									{SITE.contact.hours.days}
									<br />
									{SITE.contact.hours.time}
								</span>
							</p>
						</address>
					</div>
				</div>
			</div>

			{/* Bottom bar */}
			<div className="relative border-t border-primary/15">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-secondary-foreground/80 sm:flex-row lg:px-10">
					<p>
						&copy;{' '}
						<span suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
						Unicorn Barber Training Academy. All rights reserved.
					</p>
					<nav className="flex items-center gap-6" aria-label="Legal">
						<ul className="flex items-center gap-6">
							{LEGAL_LINKS.map((link) => (
								<li key={link.label}>
									<Link
										to={link.to}
										preload="intent"
										className="hover:text-primary"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</div>
		</footer>
	);
}

function FooterColumn({
	title,
	links,
}: {
	title: string;
	links: FooterLink[];
}) {
	return (
		<nav aria-label={title}>
			<h3 className="text-[12px] font-semibold tracking-[0.24em] text-primary">
				{title.toUpperCase()}
			</h3>
			<ul className="mt-5 space-y-3">
				{links.map((link) => (
					<li key={link.label}>
						<Link
							to={link.to}
							preload="intent"
							className="text-sm text-secondary-foreground/70 transition-colors hover:text-primary"
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}

function SocialIcon({
	href,
	label,
	children,
}: {
	href: string;
	label: string;
	children: ReactNode;
}) {
	return (
		<Button
			size="icon"
			nativeButton={false}
			render={
				// biome-ignore lint/a11y/useAnchorContent: this is fine
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={label}
				/>
			}
		>
			{children}
		</Button>
	);
}
