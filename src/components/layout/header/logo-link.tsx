import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import Logo from "@/assets/logo/logo.png";

export function LogoLink({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<Link
			to="/"
			preload="intent"
			onClick={onNavigate}
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
	);
}
