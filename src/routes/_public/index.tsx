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

export const Route = createFileRoute('/_public/')({
	head: () => ({
		meta: [
			{ title: 'Unicorn Barber Training Academy — Learn the craft in Dhaka' },
			{
				name: 'description',
				content:
					'Hands-on barbering, styling and makeup training in Banasree, Dhaka. Working instructors, full kits, day and evening cohorts, and job placement support.',
			},
		],
	}),
	component: Home,
});

function Home() {
	return (
		<div>
			<Hero />
			<CraftMarquee />
			<WhyUnicorn />
			<Stats />
			<Brand />
			<Programs />
			<Testimonials />
			<Faq />
			<Cta />
		</div>
	);
}
