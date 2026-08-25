import { IconLayoutDashboard } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionPayload } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";
import { SignOut } from "./logout";

export default function UserDropDown({
	session,
}: {
	session: SessionPayload | null;
}) {
	if (!session?.user) {
		return (
			// Quiet auth action — lets the gold Enroll CTA own the bar's hierarchy
			<Link
				to="/auth/signin"
				className={cn(
					buttonVariants({
						variant: "default", // default for mobile
					}),
					"md:border-border md:bg-background md:text-foreground md:shadow-xs md:hover:bg-muted md:hover:text-foreground md:aria-expanded:bg-muted md:aria-expanded:text-foreground md:dark:border-input md:dark:bg-input/30 md:dark:hover:bg-input/50", // overrides for desktop (default variant styles)
				)}
			>
				Sign in
			</Link>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Avatar
							aria-label={`Account menu for ${session.user.name || "user"}`}
							className="h-9 w-9 cursor-pointer border-2 border-primary/20 hover:border-primary/40 transition-all ring-offset-background hover:ring-2 hover:ring-primary/20 hover:ring-offset-2"
						/>
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
								<p className="text-xs text-muted-foreground leading-none truncate flex items-center gap-1.5">
									<span className="truncate">{session.user.email}</span>
									{session.user.emailVerified && (
										<span
											title="Email verified"
											className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
										/>
									)}
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
					</DropdownMenuGroup>

					<DropdownMenuSeparator />

					{/* Sign Out */}
					<SignOut />
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
