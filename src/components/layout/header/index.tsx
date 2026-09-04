import { IconMenu2, IconPlus } from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useRef, useState } from "react";
import Logo from "@/assets/logo/logo.png";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { SessionPayload } from "@/lib/types";
import { cn } from "@/lib/utils";
import UserDropDown from "./user";

const navItems = [
	{ name: "Home", href: "/" },
	{ name: "About", href: "/about" },
	{ name: "Programs", href: "/programs" },
	{ name: "Instructors", href: "/instructors" },
	{ name: "Gallery", href: "/gallery" },
	{ name: "Student Life", href: "/student-life" },
	{ name: "Blog", href: "/blog" },
	{ name: "Contact", href: "/contact" },
];

// Section pages stay active on child routes (/blog/<slug>, /programs/<slug>);
// the home link matches exactly so it isn't lit for every path.
function isActiveNav(pathname: string, href: string) {
	return href === "/"
		? pathname === "/"
		: pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({
	session,
}: {
	session: SessionPayload | null;
}) {
	// TanStack Router equivalent of next/navigation's usePathname().
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const [isVisible, setIsVisible] = useState(true);
	const lastScrollYRef = useRef(0);
	// Controlled so nav links can close the drawer on tap — Base UI's Dialog
	// does not auto-close when the route changes underneath it.
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const controlNavbar = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY < 10) {
				setIsVisible(true);
			} else if (
				currentScrollY > lastScrollYRef.current &&
				currentScrollY > 100
			) {
				setIsVisible(false);
			} else if (currentScrollY < lastScrollYRef.current) {
				setIsVisible(true);
			}
			lastScrollYRef.current = currentScrollY;
		};

		window.addEventListener("scroll", controlNavbar, { passive: true });
		return () => window.removeEventListener("scroll", controlNavbar);
	}, []);

	return (
		<nav
			aria-label="Main navigation"
			className={cn(
				"sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-transform duration-300",
				isVisible ? "translate-y-0" : "-translate-y-full",
			)}
		>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
				{/* ── Left: mobile menu + logo ── */}
				<div className="flex items-center gap-2">
					{/* Mobile hamburger */}
					<div className="lg:hidden">
						<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
							<SheetTrigger
								render={
									<Button variant="ghost" size="icon" className="shrink-0" />
								}
							>
								<IconMenu2 className="h-5 w-5" stroke={1.75} />
								<span className="sr-only">Toggle navigation menu</span>
							</SheetTrigger>
							<SheetContent side="left" className="w-72 p-0">
								<SheetHeader className="border-b border-border px-6 py-5">
									{/* Logo — matches footer logo treatment */}
									<SheetTitle>
										{/* Brand */}
										<Link
											to="/"
											preload="intent"
											onClick={() => setMobileOpen(false)}
											className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4"
											aria-label="Unicorn Barber Training Academy, home"
										>
											<Image
												src={Logo}
												alt="Unicorn Barber Training Academy logo"
												className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
												width={400}
												height={400}
											/>

											<span
												aria-hidden="true"
												className="h-7 w-px shrink-0 bg-foreground sm:h-8"
											/>

											<span className="flex min-w-0 flex-col leading-none">
												<span className="font-bold text-primary text-xl md:text-2xl tracking-widest">
													UNICORN
												</span>

												<span className="mt-1 truncate text-[6px] tracking-[0.2em] text-secondary-foreground/65 sm:text-[10px] sm:tracking-[0.32em]">
													BARBER TRAINING ACADEMY
												</span>
											</span>
										</Link>
									</SheetTitle>
								</SheetHeader>

								{/* Nav links */}
								<div className="flex flex-col px-4 py-4 gap-1">
									{navItems.map((item) => {
										const active = isActiveNav(pathname, item.href);
										return (
											<Link
												key={item.name}
												to={item.href}
												preload="intent"
												onClick={() => setMobileOpen(false)}
												className={cn(
													"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200",
													active
														? "bg-primary/10 text-primary"
														: "text-foreground/70 hover:text-primary hover:bg-primary/5",
												)}
											>
												{active && (
													<span className="w-1 h-4 rounded-full bg-primary shrink-0" />
												)}
												{item.name}
											</Link>
										);
									})}
								</div>

								{/* Mobile Book Now */}
								<div className="px-4 pt-2 mt-auto border-t border-border">
									<Button
										render={
											<Link to="/enroll" onClick={() => setMobileOpen(false)} />
										}
										nativeButton={false}
										className="w-full gap-2 mt-4 mb-4"
									>
										<IconPlus className="w-4 h-4" stroke={1.75} />
										Enroll Now
									</Button>
								</div>
							</SheetContent>
						</Sheet>
					</div>

					{/* Logo */}
					{/* Brand */}
					<Link
						to="/"
						preload="intent"
						className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4"
						aria-label="Unicorn Barber Training Academy, home"
					>
						<Image
							src={Logo}
							alt="Unicorn Barber Training Academy logo"
							className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
							width={400}
							height={400}
						/>

						<span
							aria-hidden="true"
							className="h-7 w-px shrink-0 bg-foreground sm:h-8"
						/>

						<span className="flex min-w-0 flex-col leading-none">
							<span className="font-bold text-primary text-xl md:text-2xl tracking-widest">
								UNICORN
							</span>

							<span className="mt-1 truncate text-[6px] tracking-[0.2em] text-secondary-foreground/65 sm:text-[10px] sm:tracking-[0.32em]">
								BARBER TRAINING ACADEMY
							</span>
						</span>
					</Link>
				</div>

				{/* ── Center: desktop nav ── */}
				<div className="hidden lg:flex items-center gap-1">
					{navItems.map((item) => {
						const active = isActiveNav(pathname, item.href);
						return (
							<Link
								key={item.name}
								to={item.href}
								preload="intent"
								className={cn(
									"relative px-3 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary group",
									active ? "text-primary" : "text-muted-foreground",
								)}
							>
								{item.name}
								{/* Active underline — h-px rule from design system */}
								<span
									className={cn(
										"absolute bottom-0 left-3 right-3 h-px bg-primary transition-all duration-200",
										active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
									)}
								/>
							</Link>
						);
					})}
				</div>

				{/* ── Right: actions ── */}
				<div className="flex items-center gap-5">
					<UserDropDown session={session} />
					{/* Book Now — primary, drives conversion; solid gold on both mobile drawer and desktop bar */}
					<Button
						render={<Link to="/enroll" />}
						nativeButton={false}
						className="hidden gap-2 sm:flex"
					>
						<IconPlus className="w-4 h-4" stroke={1.75} />
						Enroll Now
					</Button>
				</div>
			</div>
		</nav>
	);
}
