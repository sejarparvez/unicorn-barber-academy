import { createFileRoute } from '@tanstack/react-router';
import ContactCta from '@/components/pages/contact/cta';
import ContactFormSection from '@/components/pages/contact/form';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { getProgramOptions } from '@/server/programs';

const TITLE = 'Contact & Visit Us in Banasree, Dhaka | Unicorn Academy';
const DESCRIPTION =
	'Talk to admissions at Unicorn Barber Training Academy in Banasree, Dhaka. Call, WhatsApp or send a message about barbering, styling and makeup programs.';

export const Route = createFileRoute('/_public/contact')({
	loader: () => getProgramOptions(),
	head: () => {
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'Contact', path: '/contact' },
		]);

		return pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/contact',
			keywords: [
				'contact Unicorn Barber Training Academy',
				'barber school Banasree',
				'barbering course admission Dhaka',
			],
			jsonLd: [
				webPageSchema({
					type: 'ContactPage',
					name: TITLE,
					description: DESCRIPTION,
					path: '/contact',
					breadcrumb,
				}),
			],
		});
	},
	component: Contact,
});

function Contact() {
	const programs = Route.useLoaderData();

	return (
		<main>
			<ContactFormSection programs={programs} />
			<ContactCta />
		</main>
	);
}
