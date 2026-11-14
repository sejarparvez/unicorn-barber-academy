import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Toaster } from '@/components/ui/sonner';
import { getSession } from '@/lib/auth.functions';
import { organizationGraph } from '@/lib/schema';
import { LLMS_TXT_LINK } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { getProgramOptions } from '@/server/programs';

import appCss from '../styles.css?url';

const DEFAULT_TITLE = `${SITE.name} | Barbering, Styling & Makeup School in Dhaka`;

export const Route = createRootRoute({
	beforeLoad: async () => {
		const [session, programOptions] = await Promise.all([
			getSession(),
			getProgramOptions(),
		]);
		return { session, programOptions };
	},
	head: () => ({
		meta: [
			{
				charSet: 'utf-8',
			},
			{
				name: 'viewport',
				content: 'width=device-width, initial-scale=1',
			},
			{
				title: DEFAULT_TITLE,
			},
			{
				name: 'description',
				content: SITE.description,
			},
			{
				name: 'robots',
				content:
					'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
			},
			{ name: 'application-name', content: SITE.name },
			{ name: 'apple-mobile-web-app-title', content: SITE.shortName },
			{ name: 'apple-mobile-web-app-capable', content: 'yes' },
			{ name: 'format-detection', content: 'telephone=no' },
			{ name: 'theme-color', content: SITE.themeColor },
			{ name: 'color-scheme', content: 'dark light' },
			{ name: 'author', content: SITE.name },
			// Legacy local-search signals; harmless alongside the LocalBusiness JSON-LD.
			{ name: 'geo.region', content: 'BD-13' },
			{ name: 'geo.placename', content: 'Banasree, Dhaka' },
			{
				name: 'geo.position',
				content: `${SITE.geo.latitude};${SITE.geo.longitude}`,
			},
			{
				name: 'ICBM',
				content: `${SITE.geo.latitude}, ${SITE.geo.longitude}`,
			},
			{ property: 'og:site_name', content: SITE.name },
			{ property: 'og:locale', content: 'en_US' },
			{ name: 'twitter:site', content: SITE.xHandle },
			{ name: 'twitter:creator', content: SITE.xHandle },
			{
				// Site-wide entity graph: name, address, hours and social profiles.
				'script:ld+json': organizationGraph(),
			},
		],
		links: [
			{
				rel: 'stylesheet',
				href: appCss,
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '32x32',
				href: '/favicon-32x32.png',
			},
			{
				rel: 'icon',
				type: 'image/png',
				sizes: '192x192',
				href: '/icon-192.png',
			},
			{
				rel: 'apple-touch-icon',
				sizes: '180x180',
				href: '/apple-touch-icon.png',
			},
			{
				rel: 'manifest',
				href: '/site.webmanifest',
			},
			LLMS_TXT_LINK,
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" dir="ltr">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Toaster richColors />
				{import.meta.env.DEV ? (
					<TanStackDevtools
						config={{
							position: 'bottom-right',
						}}
						plugins={[
							{
								name: 'Tanstack Router',
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				) : null}
				<Scripts />
			</body>
		</html>
	);
}
