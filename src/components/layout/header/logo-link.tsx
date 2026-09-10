import { Link } from "@tanstack/react-router";
import Logo from "@/assets/logo/logo.png";
import Logo64 from "@/assets/logo/logo-64.webp";
import Logo96 from "@/assets/logo/logo-96.webp";
import Logo192 from "@/assets/logo/logo-192.webp";

export function LogoLink({ onNavigate }: { onNavigate?: () => void }) {
	return (
		<Link
			to="/"
			preload="intent"
			onClick={onNavigate}
			className="flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-4"
			aria-label="Unicorn Barber Training Academy, home"
		>
			<picture className="contents">
				<source
					type="image/webp"
					srcSet={`${Logo64} 64w, ${Logo96} 96w, ${Logo192} 192w`}
					sizes="48px"
				/>
				<img
					src={Logo}
					alt="Unicorn Barber Training Academy logo"
					className="h-8 w-auto shrink-0 sm:h-10"
					width={550}
					height={454}
					loading="eager"
				/>
			</picture>

			<span
				aria-hidden="true"
				className="h-7 w-px shrink-0 bg-foreground sm:h-8"
			/>

			<span className="flex min-w-0 flex-col leading-none">
				<span className="font-bold text-primary text-xl md:text-2xl tracking-widest">
					UNICORN
				</span>

				<span className="mt-1 truncate text-[6px] tracking-[0.2em] text-secondary-foreground/80 sm:text-[10px] sm:tracking-[0.32em]">
					BARBER TRAINING ACADEMY
				</span>
			</span>
		</Link>
	);
}
