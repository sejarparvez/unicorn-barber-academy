import { IconArrowRight } from "@tabler/icons-react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { QueryProvider } from "@/components/providers/query-provider";
import { SITE_URL } from "@/data/site";
import type { SessionPayload } from "@/lib/types";
import { getSession } from "@/server/session";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	// Fetched on every document load so <Header/> renders the correct
	// signed-in/out state during SSR — no hydration flicker.
	loader: async (): Promise<{ session: SessionPayload | null }> => ({
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
			{ property: "og:site_name", content: "Unicorn Barber Training Academy" },
			{ property: "og:locale", content: "en_US" },
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
			{ rel: "icon", type: "image/png", href: "/favicon.png" },
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
		],
	}),
	component: RootDocument,
	notFoundComponent: RootNotFound,
});

function RootNotFound() {
	return (
		<main className="mx-auto max-w-xl px-6 py-32 text-center">
			<h1 className="font-heading text-3xl font-medium text-foreground">
				Page not found
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
			</p>
			<Link
				to="/"
				className="mt-8 inline-flex items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
			>
				BACK TO HOME
				<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
			</Link>
		</main>
	);
}

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
