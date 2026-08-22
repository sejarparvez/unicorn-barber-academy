import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { QueryProvider } from "@/components/providers/query-provider";
import type { SessionPayload } from "@/lib/server-session";
import { getSession } from "@/lib/server-session";
import { SITE_URL } from "@/lib/site-data";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	// Fetched on every document load so <Header/> renders the correct
	// signed-in/out state during SSR — no hydration flicker.
	loader: async (): Promise<{ session: SessionPayload }> => ({
		session: await getSession(),
	}),
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title:
					"Unicorn Barber Training Academy | Barbering & Beauty Courses in Dhaka",
			},
			// Default social-card image; individual routes override og:* as needed
			{ property: "og:image", content: `${SITE_URL}/banner.png` },
			{ property: "og:image:width", content: "4001" },
			{ property: "og:image:height", content: "2001" },
			{
				property: "og:image:alt",
				content: "Unicorn Barber Training Academy banner",
			},
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:image", content: `${SITE_URL}/banner.png` },
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	component: RootDocument,
});

function RootDocument() {
	const { session } = Route.useLoaderData();
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<Header session={session} />
				<div id="main-content" className=" min-h-screen">
					<QueryProvider>
						<Outlet />
					</QueryProvider>
				</div>
				<Footer />
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
