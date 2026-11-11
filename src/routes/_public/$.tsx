import { createFileRoute, notFound } from '@tanstack/react-router';

export const Route = createFileRoute('/_public/$')({
	head: () => ({
		meta: [{ title: 'Page not found — Unicorn Barber Training Academy' }],
	}),
	// Any URL that reaches this catch-all doesn't exist. Throwing `notFound()`
	// keeps the HTTP status a real 404 (SSR) while rendering the router's
	// `defaultNotFoundComponent` inside the `_public` layout, so the header
	// stays visible.
	beforeLoad: () => {
		throw notFound();
	},
});
