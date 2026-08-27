import { IconArrowRight } from "@tabler/icons-react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRoute,
	HeadContent,
	Link,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { PageTransition, ScrollProgress } from "@/components/effects";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { StickyEnrollBar } from "@/components/layout/sticky-enroll-bar";
import { WhatsappFloat } from "@/components/layout/whatsapp-float";
import { Analytics } from "@/components/providers/analytics";
import { QueryProvider } from "@/components/providers/query-provider";
import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL } from "@/data/site";
import type { SessionPayload } from "@/lib/types";
import { getSession } from "@/server/session";
import appCss from "../styles.css?url";

/** Marketing-pages-only mount: the mobile enroll bar stays off the
    dashboard/auth surfaces where it would fight app chrome. */
function StickyEnrollMaybe() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isMarketing =
		!pathname.startsWith("/dashboard") &&
		!pathname.startsWith("/auth") &&
		!pathname.startsWith("/verify") &&
		!pathname.includes("/print");
	return isMarketing ? <StickyEnrollBar /> : null;
}

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
			// RSS autodiscovery — /feed.xml exists but was undiscoverable.
			{
				rel: "alternate",
				type: "application/rss+xml",
				title: "Unicorn Barber Training Academy Blog",
				href: "/feed.xml",
			},
		],
	}),
	component: RootDocument,
	notFoundComponent: RootNotFound,
	errorComponent: RootError,
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

function RootError({ error }: { error: Error }) {
	return (
		<main className="mx-auto max-w-xl px-6 py-32 text-center">
			<h1 className="font-heading text-3xl font-medium text-foreground">
				Something went wrong
			</h1>
			<p className="mt-3 text-sm text-muted-foreground">
				An unexpected error occurred while loading this page. Please try again —
				if the problem persists, contact us.
			</p>
			{import.meta.env.DEV && error ? (
				<pre className="mt-6 max-h-48 overflow-auto rounded-md border border-border bg-muted/40 p-4 text-left text-xs whitespace-pre-wrap text-muted-foreground">
					{error.message}
				</pre>
			) : null}
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="mt-8 inline-flex cursor-pointer items-center gap-2 border border-primary px-6 py-3 text-[12px] font-semibold tracking-[0.16em] text-primary hover:bg-primary hover:text-primary-foreground"
			>
				RELOAD PAGE
				<IconArrowRight className="h-3.5 w-3.5" stroke={1.75} />
			</button>
		</main>
	);
}

function RootDocument() {
	const { session } = Route.useLoaderData();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isMarketing =
		!pathname.startsWith("/dashboard") &&
		!pathname.startsWith("/auth") &&
		!pathname.startsWith("/verify") &&
		!pathname.includes("/print");
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{/* Skip link — keyboard users jump straight past the header. */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
				>
					Skip to content
				</a>
				{isMarketing ? <ScrollProgress /> : null}
				{/* Site chrome never prints — certificate pages rely on this. */}
				<div className="print:hidden">
					<Header session={session} />
				</div>
				<div id="main-content" className=" min-h-screen">
					<TooltipProvider>
						<QueryProvider>
							{isMarketing ? (
								<PageTransition pageKey={pathname}>
									<Outlet />
								</PageTransition>
							) : (
								<Outlet />
							)}
						</QueryProvider>
					</TooltipProvider>
				</div>
				<div className="print:hidden">
					<Footer />
					<WhatsappFloat />
					<StickyEnrollMaybe />
				</div>
				<Analytics />
				<SmoothScroll />
				<Toaster position="bottom-right" richColors closeButton />
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
