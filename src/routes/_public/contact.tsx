import { createFileRoute } from '@tanstack/react-router';
import ContactCta from '@/components/pages/contact/cta';
import ContactFormSection from '@/components/pages/contact/form';

export const Route = createFileRoute('/_public/contact')({
	head: () => ({
		meta: [
			{ title: 'Contact — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Talk to admissions at Unicorn Barber Training Academy in Banasree, Dhaka. Call, WhatsApp or send a message about barbering, styling and makeup programs.',
			},
		],
	}),
	component: Contact,
});

function Contact() {
	return (
		<main>
			<ContactFormSection />
			<ContactCta />
		</main>
	);
}
