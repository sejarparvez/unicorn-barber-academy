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
				"fixed top-0 z-50 w-full bg-secondary text-secondary-foreground transition-shadow",
			)}
		>
			<div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
				{/* Brand */}
				<Link
					to="/"
					className="flex shrink-0 items-center gap-2.5 sm:gap-4 min-w-0"
					aria-label="Unicorn Barber Training Academy, home"
				>
					<Image
						src={logo}
						alt="Unicorn Barber Training Academy logo"
						className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
						width={400}
						height={400}
					/>
					<span className="h-7 w-px shrink-0 bg-linear-to-b from-[#F4C430] via-primary to-[#8B6914] sm:h-8" />
					<span className="flex flex-col min-w-0 leading-none">
						<span
							className="bg-linear-to-r from-[#F4C430] via-primary to-[#8B6914] bg-clip-text text-base sm:text-xl tracking-[0.12em] sm:tracking-[0.14em] text-transparent truncate"
							style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
						>
							UNICORN
						</span>
						<span className="mt-1 text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.32em] text-secondary-foreground/60 truncate">
							BARBER TRAINING ACADEMY
						</span>
					</span>
				</Link>

				{/* Desktop nav */}
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
							className="group relative text-[12px] xl:text-[13px] font-medium tracking-[0.14em] xl:tracking-[0.18em] text-secondary-foreground/75 transition-colors hover:text-primary whitespace-nowrap"
							activeProps={{ className: "text-primary" }}
						>
							{link.label.toUpperCase()}
							<span className="absolute -bottom-1.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full in-[.active]:w-full" />
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
							"hidden sm:inline-flex text-xs xl:text-sm",
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
							className="w-[280px] max-w-[85vw] border-l border-primary/20 bg-secondary text-secondary-foreground p-6"
						>
							<SheetHeader className="sr-only">
								<SheetTitle>Navigation Menu</SheetTitle>
							</SheetHeader>
							<nav className="mt-8 flex flex-col gap-6" aria-label="Mobile">
								{NAV_LINKS.map((link) => (
									<SheetClose
										key={link.label}
										render={
											<Link
												to={link.to}
												preload="intent"
												className="text-sm font-medium tracking-[0.18em] text-secondary-foreground/80 transition-colors hover:text-primary"
												activeProps={{ className: "text-primary" }}
											/>
										}
									>
										{link.label.toUpperCase()}
									</SheetClose>
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
			<div className="h-px w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-70" />
		</header>
	);
}
