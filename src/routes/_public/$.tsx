import { createFileRoute, notFound } from '@tanstack/react-router';
import { pageSeo } from '@/lib/seo';

export const Route = createFileRoute('/_public/$')({
	head: () =>
		pageSeo({
			title: 'Page not found | Unicorn Barber Training Academy',
			description: 'The page you are looking for could not be found.',
			path: '/404',
			noindex: true,
		}),
	// Any URL that reaches this catch-all doesn't exist. Throwing `notFound()`
	// keeps the HTTP status a real 404 (SSR) while rendering the router's
	// `defaultNotFoundComponent` inside the `_public` layout, so the header
	// stays visible.
	beforeLoad: () => {
		throw notFound();
	},
});
