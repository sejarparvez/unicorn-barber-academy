import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
	useRouterState,
} from '@tanstack/react-router';
import { AppSidebar } from '@/components/layout/dashboard/app-sidebar';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';

export const Route = createFileRoute('/dashboard')({
	head: () => ({
		meta: [
			{ title: 'Dashboard | Unicorn Barber Training Academy' },
			{ name: 'robots', content: 'noindex, nofollow' },
		],
	}),
	beforeLoad: ({ context, location }) => {
		if (!context.session) {
			throw redirect({
				to: '/auth/signin',
				search: { redirect: location.href },
			});
		}

		return { session: context.session };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const pageTitle =
		pathname === '/dashboard'
			? 'Overview'
			: (pathname.split('/').filter(Boolean).at(-1) ?? 'Overview')
					.replaceAll('-', ' ')
					.replace(/\b\w/g, (character) => character.toUpperCase());

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<Header />
				<div className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink render={<Link to="/dashboard" />}>
										Dashboard
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{pageTitle}</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</div>
				<Outlet />
				<Footer />
			</SidebarInset>
		</SidebarProvider>
	);
}
