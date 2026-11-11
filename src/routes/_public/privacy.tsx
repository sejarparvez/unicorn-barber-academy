import { IconUserShield } from '@tabler/icons-react';
import { createFileRoute } from '@tanstack/react-router';
import {
	Callout,
	ContactCta,
	KeyTerm,
	LEGAL_CONTACT,
	LegalContactGrid,
	LegalList,
	LegalPage,
	LegalSection,
	type LegalSectionMeta,
} from '@/components/pages/legal/legal-page';

export const Route = createFileRoute('/_public/privacy')({
	head: () => ({
		meta: [
			{ title: 'Privacy Policy — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'How Unicorn Barber Training Academy collects, uses, shares and protects the personal information of applicants and students.',
			},
		],
	}),
	component: PrivacyPage,
});

const LAST_UPDATED = 'August 2025';

const SECTIONS: LegalSectionMeta[] = [
	{ id: 'collection', number: '01', title: 'Information we collect' },
	{ id: 'use', number: '02', title: 'How we use your information' },
	{ id: 'sharing', number: '03', title: 'Sharing & disclosure' },
	{ id: 'retention', number: '04', title: 'Data retention' },
	{ id: 'rights', number: '05', title: 'Your rights' },
	{ id: 'cookies', number: '06', title: 'Cookies & analytics' },
	{ id: 'security', number: '07', title: 'Security' },
	{ id: 'changes', number: '08', title: 'Changes to this policy' },
	{ id: 'contact', number: '09', title: 'Contact us' },
];

const SUMMARY_POINTS = [
	'We only collect what we need to review applications and run our programs.',
	'We never sell your personal information.',
	'We share data only with service providers, placement partners (with consent) or when the law requires it.',
	'You can ask to access, correct or delete your information at any time.',
];

function PrivacyPage() {
	return (
		<LegalPage
			title="Privacy"
			titleAccent="policy"
			description="What we collect, why we collect it, and the control you have over your personal information — in plain language."
			lastUpdated={LAST_UPDATED}
			readingTime="About 4 minutes"
			meta={[
				{
					label: 'Applies to',
					value: 'Website & students',
					icon: <IconUserShield className="size-4" stroke={1.75} />,
				},
			]}
			sections={SECTIONS}
			summaryTitle="Your privacy at a glance"
			summaryDescription="The essentials at a glance. The full sections below are what actually apply."
			summaryPoints={SUMMARY_POINTS}
		>
			<LegalSection section={SECTIONS[0]}>
				<p>
					We collect information you provide directly to us when you submit an
					enrollment application, fill in a contact form, or otherwise
					communicate with the academy. We also collect a limited amount of
					technical information automatically when you browse the site.
				</p>
				<ul className="grid gap-3 sm:grid-cols-2">
					<KeyTerm
						term="Information you give us"
						description="Name, email address, phone number, program and cohort preferences, and anything you write in an application or message."
					/>
					<KeyTerm
						term="Collected automatically"
						description="Basic device and browser details, pages visited, and approximate location from anonymised analytics."
					/>
				</ul>
				<p>
					Please only share information that is relevant to your application or
					enquiry. We do not ask for sensitive personal data through this
					website.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[1]}>
				<p>We use the information we collect to:</p>
				<LegalList>
					<li>Process and evaluate your enrollment application</li>
					<li>Communicate with you about your application status</li>
					<li>Respond to your enquiries and provide support</li>
					<li>
						Send administrative communications, such as schedule changes and
						policy updates
					</li>
					<li>Improve our website, programs and services</li>
					<li>Comply with legal obligations</li>
				</LegalList>
				<p>
					We do not use your information for automated decision-making, and we
					do not send marketing messages unless you have asked to hear from us.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[2]}>
				<p>
					We do not sell your personal information. We may share it only in the
					following circumstances:
				</p>
				<LegalList>
					<li>
						With service providers who perform services on our behalf, such as
						email delivery and analytics
					</li>
					<li>
						With partner salons and barbershops for placement purposes, and only
						with your consent
					</li>
					<li>
						With regulatory bodies where required by law, such as BTEB for NTVQF
						registration
					</li>
					<li>
						With legal authorities when required by law or to protect our rights
					</li>
				</LegalList>
				<Callout>
					<strong className="font-semibold text-foreground">
						We never sell your data.
					</strong>{' '}
					Sharing is limited to the cases listed above, and service providers
					are only given what they need to do their job.
				</Callout>
			</LegalSection>

			<LegalSection section={SECTIONS[3]}>
				<p>
					We retain your personal information only for as long as necessary to
					fulfil the purposes outlined in this policy, unless a longer retention
					period is required or permitted by law.
				</p>
				<p>
					Application data is retained for up to 3 years for admissions records
					and alumni tracking. When information is no longer needed, we delete
					or anonymise it.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[4]}>
				<p>
					Depending on your location, you may have certain rights regarding your
					personal information, including:
				</p>
				<LegalList>
					<li>A copy of the personal information we hold about you</li>
					<li>Correction of inaccurate or incomplete information</li>
					<li>Deletion of information we no longer need</li>
					<li>Objection to, or restriction of, certain processing</li>
					<li>Withdrawal of consent where processing is based on consent</li>
				</LegalList>
				<p>
					To exercise any of these rights, email us at{' '}
					<a
						href={`mailto:${LEGAL_CONTACT.email}`}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						{LEGAL_CONTACT.email}
					</a>
					. We may ask you to verify your identity before acting on a request.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[5]}>
				<p>
					Our website uses cookies and similar technologies to keep the site
					working and to understand how visitors use it. You can control or
					clear cookies through your browser settings.
				</p>
				<ul className="grid gap-3 sm:grid-cols-2">
					<KeyTerm
						term="Essential cookies"
						description="Keep the site working — for example, remembering your session and security settings."
					/>
					<KeyTerm
						term="Analytics cookies"
						description="Anonymised usage data that helps us understand which pages and programs are useful."
					/>
				</ul>
				<p>
					Blocking cookies may affect some parts of the site, but you can still
					browse our programs and contact the academy.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[6]}>
				<p>
					We implement appropriate technical and organisational measures to
					protect your personal information against unauthorised access,
					alteration, disclosure or destruction.
				</p>
				<p>
					Access to applicant and student records is limited to staff who need
					it to do their work.
				</p>
				<Callout>
					No internet transmission is completely secure. If you believe your
					information has been compromised, contact us straight away.
				</Callout>
			</LegalSection>

			<LegalSection section={SECTIONS[7]}>
				<p>
					We may update this policy from time to time. The current version will
					always be posted on this page with the effective date, and material
					changes will be communicated where appropriate.
				</p>
				<p className="text-muted-foreground text-sm">
					Last updated: {LAST_UPDATED}.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[8]}>
				<p>
					If you have questions about this privacy policy or our data practices,
					contact the academy and we will do our best to help.
				</p>
				<LegalContactGrid />
				<ContactCta />
			</LegalSection>
		</LegalPage>
	);
}
