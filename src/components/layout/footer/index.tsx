import {
	IconBrandFacebook,
	IconBrandInstagram,
	IconBrandYoutube,
	IconClock,
	IconMail,
	IconMapPin,
	IconPhone,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import type { ReactNode } from "react";
import logo from "@/assets/logo/logo.png";

type FooterLink = { label: string; to: string };

const PROGRAMS: FooterLink[] = [
	{ label: "Classic Barbering", to: "/programs/classic-barbering" },
	{ label: "Beard Sculpting", to: "/programs/beard-sculpting" },
	{ label: "Fades & Tapers", to: "/programs/fades-and-tapers" },
	{ label: "Business of Barbering", to: "/programs/business-of-barbering" },
];

const ACADEMY: FooterLink[] = [
	{ label: "About Us", to: "/about" },
	{ label: "Instructors", to: "/instructors" },
	{ label: "Student Life", to: "/student-life" },
	{ label: "Careers", to: "/careers" },
];

const LEGAL_LINKS: FooterLink[] = [
	{ label: "Privacy", to: "/privacy" },
	{ label: "Terms", to: "/terms" },
	{ label: "Sitemap", to: "/sitemap" },
];

/**
 * LocalBusiness structured data so search engines can surface address, phone,
 * and hours directly in results. Keep this in sync with the markup below.
 */
const LOCAL_BUSINESS_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "EducationalOrganization",
	name: "Unicorn Barber Training Academy",
	url: "https://unicornbta.com",
	telephone: "+880-1234-567890",
	email: "hello@unicornbta.com",
	address: {
		"@type": "PostalAddress",
		streetAddress: "123 Fade Street",
		addressLocality: "Gulshan, Dhaka",
		postalCode: "1212",
		addressCountry: "BD",
	},
	openingHours: "Mo-Sa 09:00-19:00",
	sameAs: [
		"https://instagram.com",
		"https://facebook.com",
		"https://youtube.com",
	],
};

export default function Footer() {
	return (
		<footer className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<script
				type="application/ld+json"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(LOCAL_BUSINESS_JSON_LD),
				}}
			/>

			{/* Top gradient hairline, echoing the header divider */}
			<div className="h-px w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />

			{/* Faint watermark crest for texture */}
			<svg
				viewBox="0 0 400 400"
				aria-hidden="true"
				className="pointer-events-none absolute -right-16 -bottom-24 h-[420px] w-[420px] opacity-[0.04]"
			>
				<path
					d="M200 40 L240 190 L200 360 L160 190 Z"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="3"
				/>
				<circle
					cx="200"
					cy="200"
					r="180"
					fill="none"
					stroke="#D4AF37"
					strokeWidth="2"
				/>
			</svg>

			<div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10">
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
								alt="Unicorn Barber Training Academy logo"
								className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
								width={400}
								height={400}
							/>
							<span className="h-7 w-px shrink-0 bg-linear-to-b from-[#F4C430] via-primary to-[#8B6914] sm:h-8" />
							<span className="flex flex-col min-w-0 leading-none">
								<span
									className="bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-base sm:text-xl tracking-[0.12em] sm:tracking-[0.14em] text-transparent truncate"
									style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
								>
									UNICORN
								</span>
								<span className="mt-1 text-[8px] sm:text-[10px]  text-secondary-foreground/60 truncate">
									BARBER TRAINING ACADEMY
								</span>
							</span>
						</Link>

						<p className="mt-5 max-w-xs text-sm leading-relaxed text-secondary-foreground/65">
							Sharpening tomorrow&apos;s master barbers, one blade at a time.
							Hands-on training, taught by working professionals.
						</p>
						<div className="mt-6 flex items-center gap-4">
							<SocialIcon href="https://instagram.com" label="Instagram">
								<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
							</SocialIcon>
							<SocialIcon href="https://facebook.com" label="Facebook">
								<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
							</SocialIcon>
							<SocialIcon href="https://youtube.com" label="YouTube">
								<IconBrandYoutube className="h-4 w-4" stroke={1.75} />
							</SocialIcon>
						</div>
					</div>

					<div className="hidden bg-primary/15 lg:block" />

					{/* Programs column */}
					<FooterColumn title="Programs" links={PROGRAMS} />

					<div className="hidden bg-primary/15 lg:block" />

					{/* Academy column */}
					<FooterColumn title="Academy" links={ACADEMY} />

					<div className="hidden bg-primary/15 lg:block" />

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
								<span>123 Fade Street, Gulshan, Dhaka 1212</span>
							</p>
							<p className="flex items-start gap-3">
								<IconPhone
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a href="tel:+8801234567890" className="hover:text-primary">
									+880 1234-567890
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconMail
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a
									href="mailto:hello@unicornbta.com"
									className="hover:text-primary"
								>
									hello@unicornbta.com
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconClock
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<span>Mon&ndash;Sat, 9AM&ndash;7PM</span>
							</p>
						</address>
					</div>
				</div>
			</div>

			{/* Bottom bar */}
			<div className="relative border-t border-primary/15">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-secondary-foreground/50 sm:flex-row lg:px-10">
					<p>
						&copy; {new Date().getFullYear()} Unicorn Barber Training Academy.
						All rights reserved.
					</p>
					<nav className="flex items-center gap-6" aria-label="Legal">
						{LEGAL_LINKS.map((link) => (
							<Link
								key={link.label}
								to={link.to}
								preload="intent"
								className="hover:text-primary"
							>
								{link.label}
							</Link>
						))}
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
		<div>
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
		</div>
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
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			aria-label={label}
			className="flex h-9 w-9 items-center justify-center border border-primary/30 text-primary/80 transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
		>
			{children}
		</a>
	);
}
