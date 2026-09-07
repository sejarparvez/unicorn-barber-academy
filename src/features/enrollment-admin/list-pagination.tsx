// src/features/enrollment-admin/list-pagination.tsx
// Shared pagination footer for the applications and blog post lists.
import { Button } from "@/components/ui/button";

type Props = {
	page: number;
	totalPages: number;
	total: number;
	onPrevious: () => void;
	onNext: () => void;
};

export function ListPagination({
	page,
	totalPages,
	total,
	onPrevious,
	onNext,
}: Props) {
	if (totalPages <= 1) return null;

	return (
		<footer className="flex items-center justify-between text-sm">
			{page > 1 ? (
				<Button variant="outline" size="sm" onClick={onPrevious}>
					Previous
				</Button>
			) : (
				<span className="text-muted-foreground">Previous</span>
			)}
			<span className="text-muted-foreground">
				Page {page} of {totalPages} · {total} applications
			</span>
			{page < totalPages ? (
				<Button variant="outline" size="sm" onClick={onNext}>
					Next
				</Button>
			) : (
				<span className="text-muted-foreground">Next</span>
			)}
		</footer>
	);
}
