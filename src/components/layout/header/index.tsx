import { IconMenu2 } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import logo from "@/assets/logo/logo.png";
import { Button, buttonVariants } from "@/components/ui/button";

import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ctaClassName = cn(buttonVariants({ variant: "default" }), "px-4");

type NavLink = {
	label: string;
	to: string;
};

const NAV_LINKS: NavLink[] = [
	{ label: "Home", to: "/" },
	{ label: "Programs", to: "/programs" },
	{ label: "Instructors", to: "/instructors" },
	{ label: "Gallery", to: "/gallery" },
	{ label: "Contact", to: "/contact" },
];

export default function Header() {
	return (
		<header
			className={cn(
				"fixed top-0 z-50 w-full",
				"bg-secondary text-secondary-foreground",
				"transition-shadow",
			)}
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
				{/* Brand */}
				<Link
					to="/"
					preload="intent"
					className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4"
					aria-label="Unicorn Barber Training Academy, home"
				>
					<Image
						src={logo}
						alt="Unicorn Barber Training Academy logo"
						className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
						width={400}
						height={400}
					/>

					<span
						aria-hidden="true"
						className="h-7 w-px shrink-0 bg-linear-to-b from-[#F4C430] via-primary to-[#8B6914] sm:h-8"
					/>

					<span className="flex min-w-0 flex-col leading-none">
						<span
							className="truncate bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-base tracking-[0.12em] text-transparent sm:text-xl sm:tracking-[0.14em]"
							style={{
								fontFamily: "var(--font-heading)",
								fontWeight: 600,
							}}
						>
							UNICORN
						</span>

						<span className="mt-1 truncate text-[8px] tracking-[0.2em] text-secondary-foreground/60 sm:text-[10px] sm:tracking-[0.32em]">
							BARBER TRAINING ACADEMY
						</span>
					</span>
				</Link>
				<nav
					className="hidden items-center gap-6 lg:flex xl:gap-9"
					aria-label="Primary"
				>
					{NAV_LINKS.map((link) => (
						<Link
							key={link.label}
							to={link.to}
							preload="intent"
							activeOptions={{ exact: link.to === "/" }}
							className={cn(
								"group relative whitespace-nowrap py-2",
								"text-[12px] font-medium tracking-[0.14em]",
								"text-secondary-foreground/70",
								"transition-colors duration-200",
								"hover:text-primary",
								"xl:text-[13px] xl:tracking-[0.18em]",
							)}
							activeProps={{
								className: "text-primary active",
							}}
						>
							{link.label.toUpperCase()}

							{/* Single active / hover indicator */}
							<span
								aria-hidden="true"
								className={cn(
									"absolute -bottom-0.5 left-0",
									"h-px w-0 bg-primary",
									"transition-[width] duration-300 ease-out",
									"group-hover:w-full",
									"group-[.active]:w-full",
								)}
							/>
						</Link>
					))}
				</nav>

				{/* CTA + mobile menu */}
				<div className="flex shrink-0 items-center gap-2 sm:gap-4">
					<Link
						to="/enroll"
						preload="intent"
						className={cn(
							ctaClassName,
							"hidden rounded-none text-xs sm:inline-flex xl:text-sm",
						)}
					>
						ENROLL NOW
					</Link>

					<Sheet>
						<SheetTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									aria-label="Open menu"
									className="text-secondary-foreground hover:bg-transparent hover:text-primary lg:hidden"
								/>
							}
						>
							<IconMenu2 className="h-6 w-6" stroke={1.75} />
						</SheetTrigger>

						<SheetContent
							side="right"
							className="w-[280px] max-w-[85vw] border-l border-primary/20 bg-secondary p-6 text-secondary-foreground"
						>
							<SheetHeader className="sr-only">
								<SheetTitle>Navigation Menu</SheetTitle>
							</SheetHeader>

							<nav className="mt-8 flex flex-col gap-2" aria-label="Mobile">
								{NAV_LINKS.map((link) => (
									<SheetClose
										key={link.label}
										render={
											<Link
												to={link.to}
												preload="intent"
												activeOptions={{
													exact: link.to === "/",
												}}
												className={cn(
													"group relative flex items-center",
													"py-3",
													"text-sm font-medium tracking-[0.18em]",
													"text-secondary-foreground/80",
													"transition-colors duration-200",
													"hover:text-primary",
												)}
												activeProps={{
													className: "text-primary active",
												}}
											>
												{/* Mobile active indicator */}
												<span
													aria-hidden="true"
													className={cn(
														"mr-3 h-px w-0 bg-primary",
														"transition-all duration-300 ease-out",
														"group-hover:w-5",
														"group-[.active]:w-5",
													)}
												/>

												{link.label.toUpperCase()}
											</Link>
										}
									/>
								))}

								<SheetClose
									render={
										<Link
											to="/enroll"
											preload="intent"
											className={cn(ctaClassName, "mt-4 w-full justify-center")}
										/>
									}
								>
									ENROLL NOW
								</SheetClose>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>

			{/* Hairline divider */}
			<div
				aria-hidden="true"
				className="h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-70"
			/>
		</header>
	);
}
