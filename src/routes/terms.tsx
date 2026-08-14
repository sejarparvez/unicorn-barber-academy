import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import {
	Grain,
	GuildSeal,
	Reveal,
	SectionEyebrow,
} from "@/components/site/decor";
import { SITE_URL } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/terms")({
	component: TermsPage,
	head: () => ({
		meta: [
			{ title: "Terms of Service | Unicorn Barber Training Academy" },
			{
				name: "description",
				content:
					"Terms of service for Unicorn Barber Training Academy — governing your use of our website and enrollment in our programs.",
			},
			{
				property: "og:title",
				content: "Terms of Service | Unicorn Barber Training Academy",
			},
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: `${SITE_URL}/terms` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
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
			name: "Terms of Service",
			item: `${SITE_URL}/terms`,
		},
	],
};

function TermsPage() {
	return (
		<main className="min-h-screen">
			<script
				type="application/ld+json"
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
