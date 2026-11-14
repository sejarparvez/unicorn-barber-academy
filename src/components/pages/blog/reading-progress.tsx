import { useEffect, useState } from 'react';

/**
 * Thin gold bar pinned to the top of the viewport that tracks how far the
 * reader has scrolled through the page. Purely decorative, so it is hidden from
 * assistive tech. Renders at zero width on the server and hydrates on scroll.
 */
export function ReadingProgress() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const update = () => {
			const el = document.documentElement;
			const scrollable = el.scrollHeight - el.clientHeight;
			setProgress(
				scrollable > 0
					? Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100))
					: 0,
			);
		};

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 bg-transparent"
		>
			<div
				className="h-full bg-primary transition-[width] duration-150 ease-out"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}
