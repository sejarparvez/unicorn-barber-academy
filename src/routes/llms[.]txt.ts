import { createFileRoute } from '@tanstack/react-router';
import { getSeoContent, renderLlmsTxt } from '@/server/seo';

export const Route = createFileRoute('/llms.txt')({
	server: {
		handlers: {
			GET: async () => {
				const content = await getSeoContent();

				return new Response(renderLlmsTxt(content), {
					headers: {
						'Content-Type': 'text/markdown; charset=utf-8',
						'Cache-Control':
							'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
					},
				});
			},
		},
	},
});
