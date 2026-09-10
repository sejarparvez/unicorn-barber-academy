// src/components/providers/lazy-toaster.tsx
// Sonner is only needed the moment a toast fires, so it loads as its own
// async chunk after hydration instead of inflating the initial bundle.
// Toasts dispatched before mount are safe: sonner holds them in its
// module-level store and the Toaster flushes them on subscribe.
import { lazy, Suspense } from "react";

const Toaster = lazy(() =>
	import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);

export function LazyToaster() {
	return (
		<Suspense fallback={null}>
			<Toaster position="bottom-right" richColors closeButton />
		</Suspense>
	);
}
