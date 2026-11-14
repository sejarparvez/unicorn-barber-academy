import { createFileRoute } from '@tanstack/react-router';
import { getSeoContent, renderSitemapXml } from '@/server/seo';

export const Route = createFileRoute('/sitemap.xml')({
	server: {
		handlers: {
			GET: async () => {
				const content = await getSeoContent();

				return new Response(renderSitemapXml(content), {
					headers: {
						'Content-Type': 'application/xml; charset=utf-8',
						'Cache-Control':
							'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
					},
				});
			},
		},
	},
});
