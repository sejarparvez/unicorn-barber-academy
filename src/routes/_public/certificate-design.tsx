import { createFileRoute } from '@tanstack/react-router';
import { CertificateShowcase } from '@/components/pages/certificates/certificate-showcase';
import { pageSeo } from '@/lib/seo';

const TITLE = 'Certificate Design Studio | Unicorn Barber Training Academy';
const DESCRIPTION = 'Print-ready certificate design options for review.';

export const Route = createFileRoute('/_public/certificate-design')({
	head: () =>
		pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/certificate-design',
			noindex: true,
		}),
	component: CertificateShowcase,
});
