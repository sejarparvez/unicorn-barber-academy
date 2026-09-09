import { Skeleton } from "@/components/ui/skeleton";

export function HomeHeroSkeleton() {
	return (
		<main aria-busy="true" aria-label="Loading">
			<div className="relative mx-auto grid max-w-350 grid-cols-1 lg:grid-cols-[1fr_auto_1fr]">
				<div className="flex flex-col justify-center px-5 pt-10 pb-20 sm:px-10 lg:min-h-[88vh] lg:px-14 lg:py-0">
					<Skeleton className="h-3 w-44" />
					<Skeleton className="mt-5 h-14 w-3/4" />
					<Skeleton className="mt-2 h-14 w-1/2" />
					<Skeleton className="mt-5 h-5 w-full max-w-md" />
					<Skeleton className="mt-2 h-5 w-2/3 max-w-md" />
					<div className="mt-8 flex gap-4">
						<Skeleton className="h-12 w-36" />
						<Skeleton className="h-12 w-48" />
					</div>
				</div>
				<div aria-hidden="true" className="hidden w-14 lg:block" />
				<Skeleton className="hidden h-[88vh] w-full rounded-none lg:block" />
			</div>
			<div className="mx-auto grid max-w-7xl gap-4 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
				{[0, 1, 2].map((i) => (
					<Skeleton key={i} className="h-56 rounded-xl" />
				))}
			</div>
		</main>
	);
}

export function ArticleSkeleton() {
	return (
		<main aria-busy="true" aria-label="Loading article">
			<div className="mx-auto max-w-5xl px-6 pt-28 pb-12 lg:px-10 lg:pt-36">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="mt-6 h-6 w-24 rounded-full" />
				<Skeleton className="mt-5 h-10 w-full" />
				<Skeleton className="mt-2 h-10 w-5/6" />
				<Skeleton className="mt-2 h-10 w-2/3" />
				<div className="mt-7 flex items-center gap-3">
					<Skeleton className="h-9 w-9 rounded-full" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-48" />
					</div>
					<div className="ml-4 flex gap-2">
						{[0, 1, 2, 3].map((i) => (
							<Skeleton key={i} className="h-8 w-8 rounded-full" />
						))}
					</div>
				</div>
			</div>
			<div className="mx-auto max-w-3xl space-y-3 px-6 pb-20">
				{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
					<Skeleton
						key={i}
						className={i % 4 === 3 ? "h-4 w-2/3" : "h-4 w-full"}
					/>
				))}
			</div>
		</main>
	);
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
	return (
		<main
			aria-busy="true"
			aria-label="Loading"
			className="mx-auto max-w-7xl space-y-6 px-5 py-16"
		>
			<div className="space-y-3">
				<Skeleton className="h-3 w-32" />
				<Skeleton className="h-9 w-72" />
				<Skeleton className="h-4 w-full max-w-xl" />
			</div>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: count }).map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, order never changes
						key={`card-${i}`}
						className="overflow-hidden rounded-xl border border-border bg-card"
					>
						<Skeleton className="aspect-[16/9] w-full rounded-none" />
						<div className="space-y-2 p-4">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-5 w-full" />
							<Skeleton className="h-4 w-2/3" />
						</div>
					</div>
				))}
			</div>
		</main>
	);
}

export function FormSkeleton() {
	return (
		<main
			aria-busy="true"
			aria-label="Loading form"
			className="mx-auto max-w-3xl space-y-4 px-5 py-16"
		>
			<Skeleton className="h-3 w-28" />
			<Skeleton className="h-9 w-80" />
			<div className="space-y-4 rounded-xl border border-border bg-card p-6">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="space-y-2">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-10 w-full" />
					</div>
				))}
				<Skeleton className="h-11 w-full" />
			</div>
		</main>
	);
}

export function DetailPageSkeleton() {
	return (
		<output aria-label="Loading" className="block space-y-6">
			<header className="flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-9 rounded-md" />
				<div className="space-y-2">
					<Skeleton className="h-3 w-40" />
					<Skeleton className="h-7 w-56" />
				</div>
				<Skeleton className="h-5 w-20 rounded-full" />
				<Skeleton className="h-5 w-20 rounded-full" />
			</header>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-4 rounded-xl border border-border bg-card p-6">
					<Skeleton className="h-5 w-32" />
					<div className="grid gap-3 sm:grid-cols-2">
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<div key={i} className="space-y-1.5">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-4 w-full" />
							</div>
						))}
					</div>
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/6" />
				</div>
				<aside className="space-y-5">
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="space-y-3 rounded-xl border border-border bg-card p-5"
						>
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					))}
				</aside>
			</div>
		</output>
	);
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
	return (
		<output aria-label="Loading" className="block space-y-4">
			<div className="flex items-center justify-between gap-3">
				<div className="space-y-2">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-7 w-56" />
				</div>
				<Skeleton className="h-9 w-28" />
			</div>
			<div className="overflow-hidden rounded-xl border border-border bg-card">
				<Skeleton className="h-10 w-full rounded-none border-b border-border" />
				{Array.from({ length: rows }).map((_, i) => (
					<Skeleton
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, order never changes
						key={`row-${i}`}
						className="h-12 w-full rounded-none border-b border-border last:border-b-0"
					/>
				))}
			</div>
		</output>
	);
}
