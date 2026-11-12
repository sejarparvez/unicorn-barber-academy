import { createFileRoute } from '@tanstack/react-router';
import AboutCta from '@/components/pages/about/cta';
import AboutHero from '@/components/pages/about/hero';
import Story from '@/components/pages/about/story';
import Team from '@/components/pages/about/team';
import Timeline from '@/components/pages/about/timeline';
import Values from '@/components/pages/about/values';
import CraftMarquee from '@/components/pages/home/craft-marquee';

export const Route = createFileRoute('/_public/about')({
	head: () => ({
		meta: [
			{ title: 'About — Unicorn Barber Training Academy' },
			{
				name: 'description',
				content:
					'Unicorn Barber Training Academy is a hands-on barbering, styling and makeup school in Banasree, Dhaka. Learn how we train, who teaches, and what we promise.',
			},
		],
	}),
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
