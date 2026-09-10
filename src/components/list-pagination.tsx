// src/features/enrollment-admin/list-pagination.tsx
// Shared pagination footer for the applications and blog post lists.
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
	page: number;
	totalPages: number;
	total: number;
	itemNoun: string;
	onPage: (page: number) => void;
};

/** Compact page window: 1 … p-1 p p+1 … N. */
function pageWindow(page: number, totalPages: number): Array<number | "…"> {
	const pages = new Set([1, totalPages, page - 1, page, page + 1]);
	const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort();
	const out: Array<number | "…"> = [];
	for (const p of sorted) {
		if (out.length > 0 && p - (out[out.length - 1] as number) > 1) {
			out.push("…");
		}
		out.push(p);
	}
	return out;
}

export function ListPagination({
	page,
	totalPages,
	total,
	itemNoun,
	onPage,
}: Props) {
	if (totalPages <= 1) return null;
	const go = (target: number) => (e: React.MouseEvent) => {
		e.preventDefault();
		if (target !== page) onPage(target);
	};

	return (
		<footer className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
			<p className="text-sm text-muted-foreground">
				Page {page} of {totalPages} · {total} {itemNoun}
			</p>
			<Pagination className="mx-0 w-auto">
				<PaginationContent>
					{page > 1 ? (
						<PaginationItem>
							<PaginationPrevious href="#" onClick={go(page - 1)} />
						</PaginationItem>
					) : null}
					{pageWindow(page, totalPages).map((p, i) =>
						p === "…" ? (
							// biome-ignore lint/suspicious/noArrayIndexKey: static filler
							<PaginationItem key={`gap-${i}`}>
								<PaginationEllipsis />
							</PaginationItem>
						) : (
							<PaginationItem key={p}>
								<PaginationLink
									href="#"
									isActive={p === page}
									onClick={go(p)}
									aria-label={`Go to page ${p}`}
								>
									{p}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					{page < totalPages ? (
						<PaginationItem>
							<PaginationNext href="#" onClick={go(page + 1)} />
						</PaginationItem>
					) : null}
				</PaginationContent>
			</Pagination>
		</footer>
	);
}
