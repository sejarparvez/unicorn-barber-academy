import { IconShieldCheck } from '@tabler/icons-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
	Callout,
	ContactCta,
	type Destination,
	KeyTerm,
	LegalContactGrid,
	LegalList,
	LegalPage,
	LegalSection,
	type LegalSectionMeta,
} from '@/components/pages/legal/legal-page';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_public/terms')({
	head: () => ({
		meta: [
			{ title: 'Terms of Service — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Enrollment, payment, attendance, certification and refund terms for programs at Unicorn Barber Training Academy.',
			},
		],
	}),
	component: TermsPage,
});

const LAST_UPDATED = 'August 2025';

const PRIVACY: Destination = { label: 'Privacy Policy', to: '/privacy' };

const SECTIONS: LegalSectionMeta[] = [
	{ id: 'acceptance', number: '01', title: 'Acceptance of terms' },
	{ id: 'enrollment', number: '02', title: 'Enrollment & payment' },
	{ id: 'attendance', number: '03', title: 'Attendance & conduct' },
	{ id: 'certification', number: '04', title: 'Certification' },
	{ id: 'refunds', number: '05', title: 'Refunds & withdrawal' },
	{
		id: 'intellectual-property',
		number: '06',
		title: 'Intellectual property',
	},
	{ id: 'liability', number: '07', title: 'Limitation of liability' },
	{ id: 'force-majeure', number: '08', title: 'Force majeure' },
	{ id: 'governing-law', number: '09', title: 'Governing law' },
	{ id: 'changes', number: '10', title: 'Changes to these terms' },
	{ id: 'contact', number: '11', title: 'Contact us' },
];

const SUMMARY_POINTS = [
	'Your seat is confirmed only after your application is accepted and the deposit is paid.',
	'Cancel within 7 days of paying the deposit for a full refund.',
	'Once classes begin, refunds are pro-rata and exclude the deposit plus a 20% admin fee.',
	'Dismissal for misconduct or excessive absence means no refund.',
];

type RefundRow = {
	when: string;
	receive: string;
	highlight?: boolean;
};

const REFUND_ROWS: RefundRow[] = [
	{
		when: 'Within 7 days of paying the deposit',
		receive: 'A full refund of all amounts paid.',
	},
	{
		when: 'After the cooling-off period, before classes start',
		receive:
			'A refund of tuition paid, minus the deposit, which is retained as an administrative fee.',
	},
	{
		when: 'After classes have started',
		receive:
			'A pro-rata refund for the weeks not yet completed, minus the deposit and a 20% administrative fee on the remaining tuition.',
	},
	{
		when: 'Dismissal for cause',
		receive: 'No refund.',
		highlight: true,
	},
];

function TermsPage() {
	return (
		<LegalPage
			title="Terms of"
			titleAccent="service"
			description="The rules that keep the academy fair, safe and focused on your training — written to be read, not skimmed past."
			lastUpdated={LAST_UPDATED}
			readingTime="About 6 minutes"
			meta={[
				{
					label: 'Governing law',
					value: 'Bangladesh',
					icon: <IconShieldCheck className="size-4" stroke={1.75} />,
				},
			]}
			sections={SECTIONS}
			summaryTitle="The short version"
			summaryDescription="The essentials at a glance. The full sections below are what actually apply."
			summaryPoints={SUMMARY_POINTS}
		>
			<LegalSection section={SECTIONS[0]}>
				<p>
					By using the Unicorn Barber Training Academy website, submitting an
					enrollment application, or attending a program, you agree to these
					Terms of Service and our{' '}
					<Link
						to={PRIVACY.to}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						{PRIVACY.label}
					</Link>
					.
				</p>
				<p>
					If you do not agree with any part of these terms, please do not use
					the website or submit an application.
				</p>
				<p>
					In these terms, &ldquo;the academy&rdquo;, &ldquo;we&rdquo; and
					&ldquo;us&rdquo; mean Unicorn Barber Training Academy;
					&ldquo;you&rdquo; means the applicant or enrolled student.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[1]}>
				<p>
					Submitting an application does not guarantee admission. Every
					application is reviewed by our admissions team, and acceptance depends
					on motivation, fit and cohort availability. We may decline an
					application at our discretion.
				</p>
				<p>
					Once you are accepted, a deposit is required to reserve your seat.
					Full tuition is due before the first day of class unless a payment
					plan has been agreed with us in writing.
				</p>
				<ul className="grid gap-3 sm:grid-cols-2">
					<KeyTerm
						term="Deposit"
						description="Reserves your seat. Refundable only within the 7-day cooling-off period."
					/>
					<KeyTerm
						term="Cooling-off period"
						description="Seven days from the date the deposit is paid."
					/>
				</ul>
			</LegalSection>

			<LegalSection section={SECTIONS[2]}>
				<p>
					Students are expected to attend all scheduled sessions. Missing more
					than 20% of program hours may result in dismissal without a refund.
				</p>
				<p>
					Professional conduct is required at all times — towards instructors,
					fellow students, clients and staff. The following will result in
					immediate dismissal:
				</p>
				<LegalList>
					<li>Harassment, discrimination or intimidation</li>
					<li>Attending under the influence of drugs or alcohol</li>
					<li>Wilful damage to academy property or equipment</li>
					<li>Any behaviour that puts clients, students or staff at risk</li>
				</LegalList>
			</LegalSection>

			<LegalSection section={SECTIONS[3]}>
				<p>
					Certificates are awarded after you successfully complete all program
					requirements — practical assessments, written exams and the minimum
					attendance requirement.
				</p>
				<p>
					Certificates are issued under the National Technical and Vocational
					Qualification Framework (NTVQF) and recognised by the Bangladesh
					Technical Education Board (BTEB).
				</p>
				<Callout>
					Meeting the published requirements for your program is what earns the
					certificate — attendance alone is not enough.
				</Callout>
			</LegalSection>

			<LegalSection section={SECTIONS[4]}>
				<p>
					The cooling-off period runs for seven days from the date the deposit
					is paid. To withdraw, contact the academy using the details below.
				</p>

				<div className="overflow-hidden rounded-xl border border-border/70">
					<div className="overflow-x-auto">
						<table className="w-full min-w-xl border-collapse text-left text-sm">
							<thead>
								<tr className="bg-primary/5">
									<th
										scope="col"
										className="px-5 py-3.5 font-semibold text-[11px] text-primary uppercase tracking-[0.18em]"
									>
										When you withdraw
									</th>
									<th
										scope="col"
										className="px-5 py-3.5 font-semibold text-[11px] text-primary uppercase tracking-[0.18em]"
									>
										What you receive
									</th>
								</tr>
							</thead>
							<tbody className="text-secondary-foreground/85">
								{REFUND_ROWS.map((row) => (
									<tr
										key={row.when}
										className={cn(
											'border-border/60 border-t align-top',
											row.highlight && 'bg-destructive/6',
										)}
									>
										<th
											scope="row"
											className="px-5 py-4 font-medium text-foreground"
										>
											{row.when}
										</th>
										<td
											className={cn(
												'px-5 py-4 leading-relaxed',
												row.highlight && 'font-medium text-destructive',
											)}
										>
											{row.receive}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<Callout>
					<strong className="font-semibold text-foreground">
						Dismissal for cause means no refund.
					</strong>{' '}
					This includes dismissal for misconduct, harassment or excessive
					absence.
				</Callout>
			</LegalSection>

			<LegalSection section={SECTIONS[5]}>
				<p>
					All curriculum materials, videos, photographs and branding are the
					intellectual property of Unicorn Barber Training Academy. You may not
					reproduce, distribute or sell academy materials without written
					permission.
				</p>
				<p>
					Work you create during the program may be used by the academy for
					marketing and educational purposes with attribution.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[6]}>
				<p>
					Unicorn Barber Training Academy is not liable for any indirect,
					incidental, special or consequential damages arising from your
					participation in our programs, including but not limited to lost
					income, career opportunities or client relationships.
				</p>
				<p>Our maximum liability shall not exceed the tuition you have paid.</p>
			</LegalSection>

			<LegalSection section={SECTIONS[7]}>
				<p>
					We are not liable for delays or cancellations caused by events beyond
					our reasonable control, including natural disasters, pandemics,
					government orders or civil unrest.
				</p>
				<p>
					In such cases, we will make reasonable efforts to reschedule sessions
					or provide alternative arrangements.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[8]}>
				<p>
					These terms are governed by the laws of Bangladesh. Any disputes shall
					be resolved in the courts of Dhaka.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[9]}>
				<p>
					We may modify these terms at any time. Updated terms will be posted on
					this page with a revised effective date. Continued use of our website
					or participation in our programs constitutes acceptance of the updated
					terms.
				</p>
				<p className="text-muted-foreground text-sm">
					Last updated: {LAST_UPDATED}.
				</p>
			</LegalSection>

			<LegalSection section={SECTIONS[10]}>
				<p>
					Questions about these terms? Contact the academy and we will do our
					best to help.
				</p>
				<LegalContactGrid />
				<ContactCta />
			</LegalSection>
		</LegalPage>
	);
}
