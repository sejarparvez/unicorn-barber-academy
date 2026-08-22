import {
	IconBell,
	IconCalendar,
	IconHeadphones,
	IconHeart,
	IconLayoutDashboard,
	IconMapPin,
	IconPlus,
	IconStar,
	IconUserCog,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { SignOut } from "./logout";

export default function UserDropDown() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>
		);
	}

	if (!session?.user) {
		return (
			// Quiet auth action — lets the gold Enroll CTA own the bar's hierarchy
			<Button variant="ghost" render={<Link to="/auth/signin" />}>
				Sign in
			</Button>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Avatar className="h-9 w-9 cursor-pointer border-2 border-primary/20 hover:border-primary/40 transition-all ring-offset-background hover:ring-2 hover:ring-primary/20 hover:ring-offset-2" />
					}
				>
					<AvatarImage
						src={session.user.image ?? undefined}
						alt={session.user.name || "User avatar"}
					/>
					<AvatarFallback className="bg-primary/10 text-primary font-semibold">
						{getInitials(session.user.name)}
					</AvatarFallback>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-64" align="end" sideOffset={8}>
					{/* User Info Header */}
					<DropdownMenuLabel className="font-normal pb-3">
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10 border-2 border-primary/20">
								<AvatarImage
									src={session.user.image ?? undefined}
									alt={session.user.name || "User avatar"}
								/>
								<AvatarFallback className="bg-primary/10 text-primary font-semibold">
									{getInitials(session.user.name)}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col space-y-1 flex-1 min-w-0">
								<p className="text-sm font-semibold leading-none truncate">
									{session.user.name}
								</p>
								<p className="text-xs text-muted-foreground leading-none truncate">
									{session.user.email}
								</p>
							</div>
						</div>
					</DropdownMenuLabel>

					<DropdownMenuSeparator />

					{/* Main Actions Group */}
					<DropdownMenuGroup>
						<DropdownMenuItem
							render={
								<Link
									to="/dashboard"
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconLayoutDashboard
								className="h-4 w-4 text-primary"
								stroke={1.75}
							/>
							<span className="font-medium">Dashboard</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							render={
								<Link
									to="/dashboard/my-bookings"
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconCalendar className="h-4 w-4 text-primary" stroke={1.75} />
							<span className="font-medium">My Bookings</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							render={
								<Link
									to="/dashboard/wishlist"
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconHeart className="h-4 w-4 text-primary" stroke={1.75} />
							<span className="font-medium">Wishlist</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							render={
								<Link
									to="/dashboard/my-reviews"
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconStar className="h-4 w-4 text-primary" stroke={1.75} />
							<span className="font-medium">My Reviews</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Tour Provider Section (if applicable) */}
					{session.user.role === "PROVIDER" || session.user.role === "ADMIN" ? (
						<>
							<DropdownMenuGroup>
								<DropdownMenuItem
									render={
										<Link
											to="/list-tour"
											className="flex w-full cursor-pointer items-center gap-3 py-2.5"
										/>
									}
								>
									<IconPlus className="h-4 w-4 text-primary" stroke={1.75} />
									<span className="font-medium">List a Tour</span>
								</DropdownMenuItem>

								<DropdownMenuItem
									render={
										<Link
											to="/my-tours"
											className="flex w-full cursor-pointer items-center gap-3 py-2.5"
										/>
									}
								>
									<IconMapPin className="h-4 w-4 text-primary" stroke={1.75} />
									<span className="font-medium">My Tours</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />
						</>
					) : null}

					{/* Account Settings Group */}
					<DropdownMenuGroup>
						<DropdownMenuItem
							render={
								<Link
									to="/dashboard/account/settings"
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconUserCog className="h-4 w-4 text-primary" stroke={1.75} />
							<span className="font-medium">Account Settings</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							render={
								<Link
									to="/dashboard/notifications"
									className="flex w-full cursor-pointer items-center justify-between py-2.5"
								/>
							}
						>
							<div className="flex items-center gap-3">
								<IconBell className="h-4 w-4 text-primary" stroke={1.75} />
								<span className="font-medium">Notifications</span>
							</div>
							<Badge variant="secondary" className="h-5 px-1.5 text-xs">
								3
							</Badge>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Support & Help */}
					<DropdownMenuGroup>
						<DropdownMenuItem
							render={
								<Link
									to={
										session.user.role === "ADMIN" ? "/support/agent" : "/help"
									}
									className="flex w-full cursor-pointer items-center gap-3 py-2.5"
								/>
							}
						>
							<IconHeadphones className="h-4 w-4 text-primary" stroke={1.75} />
							<span className="font-medium">Help Center</span>
						</DropdownMenuItem>
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Sign Out */}
					<SignOut />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
