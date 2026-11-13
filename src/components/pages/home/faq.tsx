import { IconArrowRight } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from './section-heading';

type Faq = { question: string; answer: ReactNode };

const FAQS: Faq[] = [
	{
		question: 'Do I need any experience to enroll?',
		answer:
			'No. Our programs start from the fundamentals and are built for complete beginners, as well as working stylists who want to sharpen a specific skill.',
	},
	{
		question: 'What is included in the student kit?',
		answer:
			'Barbering students receive clippers and shears. Makeup and styling students receive a professional kit for their program. Everything is yours from week one.',
	},
	{
		question: 'Are the certificates recognised?',
		answer:
			'Yes. Certificates are issued under the National Technical and Vocational Qualification Framework (NTVQF) and recognised by the Bangladesh Technical Education Board (BTEB).',
	},
	{
		question: 'Do you offer payment plans?',
		answer: (
			<>
				Yes. Full tuition is due before the first day of class unless a payment
				plan has been agreed in writing. Our{' '}
				<Link
					to="/terms"
					className="font-medium text-primary underline-offset-4 hover:underline"
				>
					terms of service
				</Link>{' '}
				set out the full payment and refund rules.
			</>
		),
	},
	{
		question: 'What are the class schedules?',
		answer:
			'We run day and evening cohorts. Both follow the same curriculum with the same instructors, so you can train around a job or family.',
	},
	{
		question: 'Do you help with job placement?',
		answer:
			'Yes. More than sixty partner salons and barbershops recruit from our cohorts, and our placement team helps with introductions, portfolios and interviews.',
	},
];

const CONTACT_LINK = { label: 'Talk to admissions', to: '/contact' };

export default function Faq() {
	return (
		<section
			aria-labelledby="faq-heading"
			className="section-light relative overflow-hidden bg-background px-4 py-24 lg:px-10"
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute bottom-0 left-0 size-96 rounded-full bg-primary/5 blur-[120px]"
			/>

			<div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
				<div>
					<SectionHeading
						id="faq-heading"
						eyebrow="FAQ"
						title={
							<>
								Questions, <span className="text-primary">answered</span>.
							</>
						}
						description="Everything applicants usually ask before booking a seat. If yours is not here, we are one message away."
					/>

					<Card size="sm" className="mt-8">
						<CardContent>
							<p className="text-muted-foreground text-sm leading-relaxed">
								Still unsure whether a program is right for you? Ask us before
								you apply — no pressure, no sales pitch.
							</p>
							<Link
								to={CONTACT_LINK.to}
								className="group inline-flex items-center gap-1.5 font-semibold text-[11px] text-primary uppercase tracking-[0.16em]"
							>
								{CONTACT_LINK.label}
								<IconArrowRight
									className="size-3.5 transition-transform group-hover:translate-x-0.5"
									stroke={1.75}
								/>
							</Link>
						</CardContent>
					</Card>
				</div>

				<div className="border-border border-y">
					<Accordion multiple defaultValue={['faq-0']}>
						{FAQS.map((faq, index) => (
							<AccordionItem key={faq.question} value={`faq-${index}`}>
								<AccordionTrigger className="items-center gap-4 py-5 text-left font-medium text-[15px] text-foreground leading-relaxed hover:text-primary hover:decoration-transparent aria-expanded:text-primary">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent
									keepMounted
									className="pr-10 pb-5 text-muted-foreground text-sm leading-relaxed"
								>
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
