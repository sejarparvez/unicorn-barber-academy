// components/Footer.tsx
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
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/logo/logo.png";
import logo64 from "@/assets/logo/logo-64.webp";
import logo96 from "@/assets/logo/logo-96.webp";
import logo192 from "@/assets/logo/logo-192.webp";
import { JsonLdScript } from "@/components/jsonld-script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { OPENING_HOURS_SPEC, SITE_URL } from "@/data/site";
import type { ResolvedSettings } from "@/lib/settings";
import { useSite } from "@/lib/site-context";

type FooterLink = { label: string; to: string };

const PROGRAMS: FooterLink[] = [
	{ label: "Classic Barbering", to: "/programs/classic-barbering" },
	{ label: "Beard Sculpting", to: "/programs/beard-sculpting" },
	{ label: "Fades & Tapers", to: "/programs/fades-and-tapers" },
	{
		label: "Cosmetology Fundamentals",
		to: "/programs/cosmetology-fundamentals",
	},
	{
		label: "Hair Styling & Colouring",
		to: "/programs/hair-styling-and-colouring",
	},
	{
		label: "Bridal & Editorial Makeup",
		to: "/programs/bridal-and-editorial-makeup",
	},
];

const ACADEMY: FooterLink[] = [
	{ label: "About Us", to: "/about" },
	{ label: "Instructors", to: "/instructors" },
	{ label: "Student Life", to: "/student-life" },
	{ label: "Press & Media", to: "/media" },
	{ label: "Careers", to: "/careers" },
	{ label: "Verify Certificate", to: "/verify" },
];

const LEGAL_LINKS: FooterLink[] = [
	{ label: "Privacy", to: "/privacy" },
	{ label: "Terms", to: "/terms" },
];

/**
 * LocalBusiness/EducationalOrganization structured data so search engines
 * and AI answer engines can surface address, phone, hours, and programs
 * directly. Built from the shared site settings (admin-editable) so JSON-LD
 * and visible markup can never drift apart.
 *
 * NOTE: `logo`/`image` need a stable absolute production URL — if `logo.png`
 * is bundled/hashed by Vite, serve a static copy from /public instead
 * (e.g. /public/logo.png) and reference that path here.
 */
function localBusinessJsonLd(site: ResolvedSettings) {
	const contact = site.contact;
	return {
		"@context": "https://schema.org",
		// Dual-typed: EducationalOrganization describes what it is, LocalBusiness
		// is what makes Google treat it as a local entity for map-pack results.
		"@type": ["EducationalOrganization", "LocalBusiness"],
		// Stable entity id so other JSON-LD blocks (Course, Review,
		// BreadcrumbList) can reference the same organization via @id.
		"@id": `${SITE_URL}/#academy`,
		name: "Unicorn Barber Training Academy",
		url: SITE_URL,
		logo: `${SITE_URL}/logo.png`,
		image: `${SITE_URL}/banner.png`,
		telephone: contact.phoneE164,
		email: contact.email,
		priceRange: "$$",
		geo: {
			"@type": "GeoCoordinates",
			latitude: 23.7536,
			longitude: 90.4286,
		},
		address: {
			"@type": "PostalAddress",
			streetAddress: contact.streetAddress,
			addressLocality: contact.addressLocality,
			postalCode: contact.postalCode,
			addressCountry: contact.addressCountry,
		},
		hasMap: contact.mapsUrl,
		areaServed: site.areasServed,
		openingHoursSpecification: OPENING_HOURS_SPEC,
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: contact.phoneE164,
				email: contact.email,
				contactType: "customer service",
				areaServed: "BD",
				availableLanguage: ["en", "bn"],
			},
		],
		sameAs: [
			site.social.instagram,
			site.social.facebook,
			site.social.youtube,
			site.social.tiktok,
			site.social.x,
		].filter(Boolean),
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: "Barbering & Beauty Programs",
			itemListElement: PROGRAMS.map((program) => ({
				"@type": "Course",
				name: program.label,
				url: `${SITE_URL}${program.to}`,
				provider: {
					"@type": ["EducationalOrganization", "LocalBusiness"],
					"@id": `${SITE_URL}/#academy`,
					name: "Unicorn Barber Training Academy",
				},
			})),
		},
	};
}

export default function Footer() {
	const site = useSite();
	const { contact } = site;
	return (
		<footer className="relative overflow-hidden">
			<JsonLdScript data={localBusinessJsonLd(site)} />

			{/* Top gradient hairline, echoing the header divider */}
			<Separator
				aria-hidden="true"
				className="h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-70"
			/>

			{/* Faint watermark crest for texture */}
			<picture>
				<source
					type="image/webp"
					srcSet={`${logo64} 64w, ${logo96} 96w, ${logo192} 192w`}
					sizes="256px"
				/>
				<img
					src={logo}
					alt=""
					aria-hidden="true"
					className="pointer-events-none absolute -right-12 -bottom-16 h-auto w-64 opacity-[0.04]"
					width={550}
					height={454}
					loading="lazy"
				/>
			</picture>

			<div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-10">
				<div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1px_1fr_1px_1fr_1px_1fr]">
					{/* Brand column */}
					<div>
						<Link
							to="/"
							className="flex shrink-0 items-center gap-2.5 sm:gap-4 min-w-0"
							aria-label="Unicorn Barber Training Academy, home"
						>
							<picture className="contents">
								<source
									type="image/webp"
									srcSet={`${logo64} 64w, ${logo96} 96w, ${logo192} 192w`}
									sizes="48px"
								/>
								<img
									src={logo}
									alt="Unicorn Barber Training Academy logo"
									className="h-8 w-auto shrink-0 sm:h-10"
									width={550}
									height={454}
									loading="eager"
								/>
							</picture>
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
										contact.whatsapp,
										"_blank",
										"noopener,noreferrer",
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
							{site.social.instagram ? (
								<SocialIcon href={site.social.instagram} label="Instagram">
									<IconBrandInstagram className="h-4 w-4" stroke={1.75} />
								</SocialIcon>
							) : null}
							{site.social.facebook ? (
								<SocialIcon href={site.social.facebook} label="Facebook">
									<IconBrandFacebook className="h-4 w-4" stroke={1.75} />
								</SocialIcon>
							) : null}
							{site.social.youtube ? (
								<SocialIcon href={site.social.youtube} label="YouTube">
									<IconBrandYoutube className="h-4 w-4" stroke={1.75} />
								</SocialIcon>
							) : null}
							{site.social.tiktok ? (
								<SocialIcon href={site.social.tiktok} label="TikTok">
									<IconBrandTiktok className="h-4 w-4" stroke={1.75} />
								</SocialIcon>
							) : null}
							{site.social.x ? (
								<SocialIcon href={site.social.x} label="X (Twitter)">
									<IconBrandX className="h-4 w-4" stroke={1.75} />
								</SocialIcon>
							) : null}
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
								<span>{contact.addressDisplay}</span>
							</p>
							<p className="flex items-start gap-3">
								<IconPhone
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a href={contact.phoneHref} className="hover:text-primary">
									{contact.phoneDisplay}
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconMail
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<a
									href={`mailto:${contact.email}`}
									className="hover:text-primary"
								>
									{contact.email}
								</a>
							</p>
							<p className="flex items-start gap-3">
								<IconClock
									className="mt-0.5 h-4 w-4 shrink-0 text-primary/80"
									stroke={1.75}
								/>
								<span>{contact.hoursSummary}</span>
							</p>
						</address>
					</div>
				</div>
			</div>

			{/* Bottom bar */}
			<div className="relative border-t border-primary/15">
				<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-secondary-foreground/80 sm:flex-row lg:px-10">
					<p>
						&copy;{" "}
						{/* Server and client can straddle a year boundary — suppress the
					    harmless hydration mismatch on the year text only. */}
						<span suppressHydrationWarning>{new Date().getFullYear()}</span>{" "}
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
