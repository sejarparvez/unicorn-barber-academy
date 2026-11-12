import type { Icon } from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';

export type NavItem = {
	label: string;
	to: string;
	icon: Icon;
	visibleFor: 'all' | 'user' | 'admin';
};

export type NavGroup = {
	label: string;
	items: NavItem[];
};

export function NavMain({ groups }: { groups: NavGroup[] }) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<>
			{groups.map((group) => (
				<SidebarGroup key={group.label}>
					<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{group.items.map((item) => (
								<SidebarMenuItem key={item.to}>
									<SidebarMenuButton
										isActive={
											item.to === '/dashboard'
												? pathname === '/dashboard'
												: pathname === item.to ||
													pathname.startsWith(`${item.to}/`)
										}
										tooltip={item.label}
										render={<Link to={item.to} />}
									>
										<item.icon stroke={1.75} />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			))}
		</>
	);
}
