import { createFileRoute } from '@tanstack/react-router';
import { renderRobotsTxt } from '@/server/seo';

export const Route = createFileRoute('/robots.txt')({
	server: {
		handlers: {
			GET: async () =>
				new Response(renderRobotsTxt(), {
					headers: {
						'Content-Type': 'text/plain; charset=utf-8',
						'Cache-Control': 'public, max-age=86400, s-maxage=86400',
					},
				}),
		},
	},
});
