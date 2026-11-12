import {
	IconArticle,
	IconCalendarEvent,
	IconCash,
	IconCertificate,
	IconClipboardList,
	IconHistory,
	IconLayoutDashboard,
	IconMail,
	IconPhoto,
	IconQuestionMark,
	IconReceipt,
	IconSchool,
	IconSettings,
	IconStar,
	IconUser,
	IconUserCircle,
	IconUsers,
} from '@tabler/icons-react';
import { Link, useRouteContext } from '@tanstack/react-router';
import Logo from '@/assets/logo/logo.png';

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
} from '@/components/ui/sidebar';
import { type NavGroup, NavMain } from './nav-main';

const data = {
	navGroups: [
		{
			label: 'Overview',
			items: [
				{
					label: 'Overview',
					to: '/dashboard',
					icon: IconLayoutDashboard,
					visibleFor: 'all',
				},
			],
		},
		{
			label: 'Learning',
			items: [
				{
					label: 'My programs',
					to: '/dashboard/my-programs',
					icon: IconSchool,
					visibleFor: 'user',
				},
				{
					label: 'My certificates',
					to: '/dashboard/my-certificates',
					icon: IconCertificate,
					visibleFor: 'user',
				},
			],
		},
		{
			label: 'Payments',
			items: [
				{
					label: 'My payments',
					to: '/dashboard/my-payments',
					icon: IconReceipt,
					visibleFor: 'user',
				},
			],
		},
		{
			label: 'Admissions',
			items: [
				{
					label: 'Applications',
					to: '/dashboard/applications',
					icon: IconClipboardList,
					visibleFor: 'admin',
				},
				{
					label: 'Intakes',
					to: '/dashboard/intakes',
					icon: IconCalendarEvent,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Students',
			items: [
				{
					label: 'Students',
					to: '/dashboard/students',
					icon: IconUsers,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Finance',
			items: [
				{
					label: 'Payments',
					to: '/dashboard/payments',
					icon: IconCash,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Content',
			items: [
				{
					label: 'Programs',
					to: '/dashboard/programs',
					icon: IconSchool,
					visibleFor: 'admin',
				},
				{
					label: 'Blog',
					to: '/dashboard/blog',
					icon: IconArticle,
					visibleFor: 'admin',
				},
				{
					label: 'Instructors',
					to: '/dashboard/instructors',
					icon: IconUser,
					visibleFor: 'admin',
				},
				{
					label: 'Gallery',
					to: '/dashboard/gallery',
					icon: IconPhoto,
					visibleFor: 'admin',
				},
				{
					label: 'Testimonials',
					to: '/dashboard/testimonials',
					icon: IconStar,
					visibleFor: 'admin',
				},
				{
					label: 'FAQs',
					to: '/dashboard/faqs',
					icon: IconQuestionMark,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Certificates',
			items: [
				{
					label: 'Certificates',
					to: '/dashboard/certificates',
					icon: IconCertificate,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Communication',
			items: [
				{
					label: 'Enquiries',
					to: '/dashboard/enquiries',
					icon: IconMail,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'System',
			items: [
				{
					label: 'Site settings',
					to: '/dashboard/settings',
					icon: IconSettings,
					visibleFor: 'admin',
				},
				{
					label: 'Activity',
					to: '/dashboard/activity',
					icon: IconHistory,
					visibleFor: 'admin',
				},
			],
		},
		{
			label: 'Account',
			items: [
				{
					label: 'Profile & security',
					to: '/dashboard/account',
					icon: IconUserCircle,
					visibleFor: 'all',
				},
			],
		},
	] satisfies NavGroup[],
};

export function AppSidebar() {
	const { session } = useRouteContext({ from: '__root__' });
	const isAdmin = session?.user?.role === 'admin';

	const navGroups = data.navGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => {
				if (item.visibleFor === 'all') return true;
				return isAdmin
					? item.visibleFor === 'admin'
					: item.visibleFor === 'user';
			}),
		}))
		.filter((group) => group.items.length > 0);

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
							<img
								src={Logo}
								alt=""
								className="h-8 w-auto shrink-0"
								width={550}
								height={454}
							/>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">Unicorn Academy</span>
								<span className="truncate text-xs">Dashboard</span>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain groups={navGroups} />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
