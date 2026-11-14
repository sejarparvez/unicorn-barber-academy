import { createFileRoute } from '@tanstack/react-router';
import Brand from '@/components/pages/home/brand';
import CraftMarquee from '@/components/pages/home/craft-marquee';
import Cta from '@/components/pages/home/cta';
import Faq from '@/components/pages/home/faq';
import Hero from '@/components/pages/home/hero';
import Programs from '@/components/pages/home/programs';
import Stats from '@/components/pages/home/stats';
import Testimonials from '@/components/pages/home/testimonials';
import WhyUnicorn from '@/components/pages/home/why-us';
import { HOME_FAQS } from '@/data/faqs';
import {
	breadcrumbSchema,
	faqPageSchema,
	itemListSchema,
	webPageSchema,
} from '@/lib/schema';
import { pageSeo } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { getPrograms } from '@/server/programs';

export const Route = createFileRoute('/_public/')({
	loader: () => getPrograms(),
	head: ({ loaderData }) => {
		const programs = loaderData ?? [];
		const breadcrumb = breadcrumbSchema([{ name: 'Home', path: '/' }]);

		return pageSeo({
			title: 'Unicorn Barber Training Academy | Barber School in Dhaka',
			description: SITE.description,
			path: '/',
			keywords: [
				'barber training Dhaka',
				'barbering course Bangladesh',
				'makeup course Dhaka',
				'beauty training Banasree',
				'hair styling academy Dhaka',
			],
			jsonLd: [
				webPageSchema({
					name: SITE.name,
					description: SITE.description,
					path: '/',
					breadcrumb,
				}),
				faqPageSchema(HOME_FAQS, '/'),
				...(programs.length
					? [
							itemListSchema({
								name: 'Career programs at Unicorn Barber Training Academy',
								path: '/',
								items: programs.map((program) => ({
									name: program.title,
									path: `/programs/${program.slug}`,
									description: program.tagline,
								})),
							}),
						]
					: []),
			],
		});
	},
	component: Home,
});

function Home() {
	const programs = Route.useLoaderData();

	return (
		<div>
			<Hero />
			<CraftMarquee />
			<WhyUnicorn />
			<Stats />
			<Brand />
			<Programs programs={programs} />
			<Testimonials />
			<Faq />
			<Cta />
		</div>
	);
}
