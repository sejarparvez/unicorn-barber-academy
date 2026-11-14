import { IconArrowUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/** Floating "back to top" control that appears once the reader is well scrolled. */
export function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const update = () => setVisible(window.scrollY > 800);
		update();
		window.addEventListener('scroll', update, { passive: true });
		return () => window.removeEventListener('scroll', update);
	}, []);

	return (
		<button
			type="button"
			aria-label="Back to top"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			className={cn(
				'fixed right-5 bottom-5 z-40 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition-all duration-300 hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
				visible
					? 'translate-y-0 opacity-100'
					: 'pointer-events-none translate-y-3 opacity-0',
			)}
		>
			<IconArrowUp className="size-5" stroke={1.75} aria-hidden />
		</button>
	);
}
