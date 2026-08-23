// src/features/legal/terms-page.tsx

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
			name: "Terms of Service",
			item: `${SITE_URL}/terms`,
		},
	],
};

export function TermsPage() {
	return (
		<main className="min-h-screen">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: this is fine
				dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
			/>
			<LegalHero title="Terms of Service" />
			<LegalContent>
				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						1. Acceptance of Terms
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						By accessing and using the Unicorn Barber Training Academy website (
						<a href={SITE_URL} className="text-primary underline">
							{SITE_URL}
						</a>
						) and submitting an enrollment application, you agree to be bound by
						these Terms of Service and our Privacy Policy. If you do not agree,
						please do not use our website or submit an application.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						2. Program Enrollment
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Submitting an application does not guarantee admission. All
						applications are reviewed by our admissions team. Acceptance is
						based on motivation, fit, and cohort availability. We reserve the
						right to deny admission at our discretion.
					</p>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Upon acceptance, a deposit is required to reserve your seat.
						Deposits are non-refundable after the cooling-off period (7 days
						from payment). Full tuition is due before the first day of class
						unless a payment plan has been agreed in writing.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						3. Attendance & Conduct
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Students are expected to attend all scheduled sessions. Excessive
						absences (more than 20% of program hours) may result in dismissal
						without refund. Professional conduct is required at all times —
						towards instructors, fellow students, clients, and staff.
						Harassment, discrimination, substance use, or damage to academy
						property will result in immediate dismissal.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						4. Certification
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Certificates are awarded upon successful completion of all program
						requirements, including practical assessments, written exams, and
						minimum attendance. Certificates are issued under the National
						Technical and Vocational Qualification Framework (NTVQF) and are
						recognised by the Bangladesh Technical Education Board (BTEB).
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						5. Refund Policy
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						<strong>Cooling-off period:</strong> 7 days from deposit payment —
						full refund.
					</p>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						<strong>Before program start:</strong> Refund minus deposit
						(administrative fee).
					</p>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						<strong>After program start:</strong> Pro-rata refund based on
						completed weeks, minus deposit and administrative fee (20% of
						remaining tuition).
					</p>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						<strong>Dismissal for cause:</strong> No refund.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						6. Intellectual Property
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						All curriculum materials, videos, photographs, and branding are the
						intellectual property of Unicorn Barber Training Academy. Students
						may not reproduce, distribute, or sell academy materials without
						written permission. Student work created during the program may be
						used by the academy for marketing and educational purposes with
						attribution.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						7. Limitation of Liability
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Unicorn Barber Training Academy is not liable for any indirect,
						incidental, special, or consequential damages arising from your
						participation in our programs, including but not limited to lost
						income, career opportunities, or client relationships. Our maximum
						liability shall not exceed the tuition paid.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						8. Force Majeure
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We are not liable for delays or cancellations caused by events
						beyond our reasonable control, including natural disasters,
						pandemics, government orders, or civil unrest. In such cases, we
						will make reasonable efforts to reschedule or provide alternative
						arrangements.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						9. Governing Law
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						These terms are governed by the laws of Bangladesh. Any disputes
						shall be resolved in the courts of Dhaka.
					</p>
				</section>

				<section className="mb-12">
					<h2 className="font-heading text-2xl font-medium text-foreground">
						10. Changes to Terms
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						We may modify these terms at any time. Updated terms will be posted
						on this page with a revised effective date. Continued use of our
						website or participation in our programs constitutes acceptance of
						the updated terms. Last updated: August 2025.
					</p>
				</section>

				<section>
					<h2 className="font-heading text-2xl font-medium text-foreground">
						11. Contact Us
					</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						Questions about these terms? Contact us at:
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
