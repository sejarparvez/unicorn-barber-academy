// src/features/legal/privacy-page.tsx

import { CONTACT, SITE_URL } from "@/data/site";
import { LegalContent, LegalHero } from "@/features/legal/legal-layout";

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

export function PrivacyPage() {
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
							href={`mailto:${CONTACT.email}`}
							className="text-primary underline"
						>
							{CONTACT.email}
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
						<p>{CONTACT.addressDisplay}</p>
						<p>
							Email:{" "}
							<a
								href={`mailto:${CONTACT.email}`}
								className="text-primary underline"
							>
								{CONTACT.email}
							</a>
						</p>
						<p>
							Phone:{" "}
							<a href={CONTACT.phoneHref} className="text-primary underline">
								{CONTACT.phoneDisplay}
							</a>
						</p>
					</address>
				</section>
			</LegalContent>
		</main>
	);
}
