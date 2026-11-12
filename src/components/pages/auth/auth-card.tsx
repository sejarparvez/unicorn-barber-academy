import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import Logo from '@/assets/logo/logo.png';

export function AuthCard({
	title,
	subtitle,
	children,
}: {
	title: string;
	subtitle?: string;
	children: ReactNode;
}) {
	return (
		<main className="section-light flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6">
			<div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
				{/* Brand mark — taps home */}
				<Link
					to="/"
					className="mx-auto flex w-fit items-center"
					aria-label="Unicorn Barber Training Academy, home"
				>
					<img
						src={Logo}
						alt=""
						className="h-10 w-auto"
						width={550}
						height={454}
					/>
				</Link>

				<div className="mt-5 text-center">
					<h1 className="font-heading text-2xl font-semibold tracking-tight">
						{title}
					</h1>
					{subtitle ? (
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{subtitle}
						</p>
					) : null}
				</div>

				{children}
			</div>
		</main>
	);
}
