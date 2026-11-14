import { createFileRoute } from '@tanstack/react-router';
import AboutCta from '@/components/pages/about/cta';
import AboutHero from '@/components/pages/about/hero';
import Story from '@/components/pages/about/story';
import Team from '@/components/pages/about/team';
import Timeline from '@/components/pages/about/timeline';
import Values from '@/components/pages/about/values';
import CraftMarquee from '@/components/pages/home/craft-marquee';
import { breadcrumbSchema, webPageSchema } from '@/lib/schema';
import { pageSeo } from '@/lib/seo';

const TITLE = 'About Unicorn Barber Training Academy | Dhaka';
const DESCRIPTION =
	'Unicorn Barber Training Academy is a hands-on barbering, styling and makeup school in Banasree, Dhaka. Learn how we train, who teaches, and what we promise.';

export const Route = createFileRoute('/_public/about')({
	head: () => {
		const breadcrumb = breadcrumbSchema([
			{ name: 'Home', path: '/' },
			{ name: 'About', path: '/about' },
		]);

		return pageSeo({
			title: TITLE,
			description: DESCRIPTION,
			path: '/about',
			keywords: [
				'about Unicorn Barber Training Academy',
				'barber school Banasree',
				'beauty academy Dhaka',
			],
			jsonLd: [
				webPageSchema({
					type: 'AboutPage',
					name: TITLE,
					description: DESCRIPTION,
					path: '/about',
					breadcrumb,
				}),
			],
		});
	},
	component: About,
});

function About() {
	return (
		<main>
			<AboutHero />
			<CraftMarquee />
			<Story />
			<Values />
			<Timeline />
			<Team />
			<AboutCta />
		</main>
	);
}
