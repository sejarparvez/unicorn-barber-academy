import { createFileRoute } from '@tanstack/react-router';
import { getSeoContent, renderRssFeed } from '@/server/seo';

export const Route = createFileRoute('/rss.xml')({
	server: {
		handlers: {
			GET: async () => {
				const content = await getSeoContent();

				return new Response(renderRssFeed(content), {
					headers: {
						'Content-Type': 'application/rss+xml; charset=utf-8',
						'Cache-Control':
							'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
					},
				});
			},
		},
	},
});
