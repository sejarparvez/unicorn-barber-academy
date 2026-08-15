import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Grain, GuildSeal } from "@/components/site/decor";
import { SITE_URL } from "@/lib/site-data";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPage,
	head: () => ({
		meta: [
			{ title: "Privacy Policy | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Privacy policy for Unicorn Barber Training Academy — how we collect, use, and protect your personal information.",
			},
			{
				property: "og:title",
				content: "Privacy Policy | Unicorn Barber Training Academy",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/privacy` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
	}),
});

const BREADCRUMB_JSON_LD = {
	"@context": "https://schema.org",
	"@type": "BreadcrumbList",
	itemListElement: [
		{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
		{
			"@type": "ListItem",
			position: 2,
			name: "Privacy Policy",
			item: `${SITE_URL}/privacy`,
		},
	],
};

function PrivacyPage() {
	return (
		<main className="min-h-screen">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<LegalHero title="Privacy Policy" />
			<LegalContent>
				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						1. Information We Collect
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We collect information you provide directly to us when you submit an
						enrollment application, contact form, or otherwise communicate with
						us. This may include:
					</p>
					<ul className="mt-3 list-disc list-inside space-y-2 text-base leading-relaxed text-muted-foreground">
						<li>Name, email address, and phone number</li>
						<li>Program and cohort preferences</li>
						<li>
							Any additional information you choose to provide in message fields
						</li>
					</ul>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						2. How We Use Your Information
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We use the information we collect to:
					</p>
					<ul className="mt-3 list-disc list-inside space-y-2 text-base leading-relaxed text-muted-foreground">
						<li>Process and evaluate your enrollment application</li>
						<li>Communicate with you about your application status</li>
						<li>Respond to your inquiries and provide customer support</li>
						<li>
							Send administrative communications (e.g., schedule changes, policy
							updates)
						</li>
						<li>Improve our website, programs, and services</li>
						<li>Comply with legal obligations</li>
					</ul>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						3. Information Sharing
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We do not sell your personal information. We may share your
						information with:
					</p>
					<ul className="mt-3 list-disc list-inside space-y-2 text-base leading-relaxed text-muted-foreground">
						<li>
							Service providers who perform services on our behalf (e.g., email
							delivery, analytics)
						</li>
						<li>
							Partner salons and barbershops for placement purposes (with your
							consent)
						</li>
						<li>
							Regulatory bodies as required by law (e.g., BTEB for NTVQF
							registration)
						</li>
						<li>
							Legal authorities when required by law or to protect our rights
						</li>
					</ul>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						4. Data Retention
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We retain your personal information only for as long as necessary to
						fulfill the purposes outlined in this policy, unless a longer
						retention period is required or permitted by law. Application data
						is retained for up to 3 years for admissions records and alumni
						tracking.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						5. Your Rights
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Depending on your location, you may have certain rights regarding
						your personal information, including the right to access, correct,
						delete, or restrict processing of your data. To exercise these
						rights, contact us at
						<a
							href="mailto:hello@unicornbta.com"
							className="text-primary underline"
						>
							hello@unicornbta.com
						</a>
						.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						6. Cookies & Analytics
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Our website uses cookies and similar technologies to improve your
						experience and analyse traffic. You can control cookie preferences
						through your browser settings. We use anonymised analytics to
						understand how visitors use our site.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						7. Security
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We implement appropriate technical and organisational measures to
						protect your personal information against unauthorised access,
						alteration, disclosure, or destruction. However, no internet
						transmission is 100% secure.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						8. Changes to This Policy
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We may update this policy from time to time. The current version
						will always be posted on this page with the effective date. Last
						updated: August 2025.
					</p>
				</section>

				<section>
					<h2 className="font-heading text-2xl font-medium text-foreground">
						9. Contact Us
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						If you have questions about this privacy policy or our data
						practices, contact us at:
					</p>
					<address className="mt-3 not-italic text-base leading-relaxed text-muted-foreground">
						<p>Unicorn Barber Training Academy</p>
						<p>123 Fade Street, Gulshan, Dhaka 1212, Bangladesh</p>
						<p>
							Email:{" "}
							<a
								href="mailto:hello@unicornbta.com"
								className="text-primary underline"
							>
								hello@unicornbta.com
							</a>
						</p>
						<p>
							Phone:{" "}
							<a href="tel:+8801234567890" className="text-primary underline">
								+880 1234-567890
							</a>
						</p>
					</address>
				</section>
			</LegalContent>
		</main>
	);
}

function LegalHero({ title }: { title: string }) {
	const shouldReduceMotion = useReducedMotion();
	const fadeUp = (delay = 0) =>
		shouldReduceMotion
			? {}
			: {
					initial: { opacity: 0, y: 18 },
					animate: { opacity: 1, y: 0 },
					transition: {
						duration: 0.7,
						delay,
						ease: [0.16, 1, 0.3, 1] as const,
					},
				};

	return (
		<section className="relative overflow-hidden bg-secondary text-secondary-foreground">
			<div className="absolute inset-0 bg-black/60" />
			<Grain />

			<div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-32">
				<motion.div
					{...fadeUp(0)}
					className="flex items-center justify-center gap-2 text-[11px] tracking-[0.22em] text-secondary-foreground/50"
				>
					<a href="/" className="hover:text-primary">
						HOME
					</a>
					<span aria-hidden="true">/</span>
					<span className="text-primary">{title.toUpperCase()}</span>
				</motion.div>

				<motion.div {...fadeUp(0.06)}>
					<GuildSeal className="mx-auto mb-6 mt-6 h-12 w-12 text-primary/85" />
				</motion.div>

				<motion.h1
					{...fadeUp(0.12)}
					className="font-heading text-5xl font-medium leading-[1.08] sm:text-6xl"
				>
					{title}
				</motion.h1>
			</div>
		</section>
	);
}

function LegalContent({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-background px-6 py-16 lg:px-10">
			<div className="mx-auto max-w-3xl">
				<div className="prose prose-neutral max-w-none">{children}</div>
			</div>
		</div>
	);
}
