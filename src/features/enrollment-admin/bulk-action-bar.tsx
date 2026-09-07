// src/features/enrollment-admin/bulk-action-bar.tsx
// Sticky action bar shown when applications are selected for bulk status change.
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { ApplicationStatus } from "@/lib/enrollment";
import {
	APPLICATION_STATUS_LABELS,
	APPLICATION_STATUSES,
	parseApplicationStatus,
} from "@/lib/enrollment";

type Props = {
	selectedCount: number;
	bulkStatus: ApplicationStatus;
	onBulkStatusChange: (status: ApplicationStatus) => void;
	isPending: boolean;
	confirmOpen: boolean;
	onConfirmOpenChange: (open: boolean) => void;
	onApply: () => void;
	onClear: () => void;
};

export function BulkActionBar({
	selectedCount,
	bulkStatus,
	onBulkStatusChange,
	isPending,
	confirmOpen,
	onConfirmOpenChange,
	onApply,
	onClear,
}: Props) {
	if (selectedCount === 0) return null;

	return (
		<>
			<div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
				<span className="text-sm font-medium">{selectedCount} selected</span>
				<Select
					value={bulkStatus}
					onValueChange={(v) => {
						const parsed = parseApplicationStatus(v);
						if (parsed) onBulkStatusChange(parsed);
					}}
				>
					<SelectTrigger className="h-8 w-40 text-xs" aria-label="Bulk status">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{APPLICATION_STATUSES.map((s) => (
							<SelectItem key={s} value={s}>
								{APPLICATION_STATUS_LABELS[s]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					size="sm"
					disabled={isPending}
					onClick={() => onConfirmOpenChange(true)}
				>
					{isPending ? "Applying…" : "Apply"}
				</Button>
				<Button size="sm" variant="ghost" onClick={onClear}>
					Clear
				</Button>
			</div>

			<AlertDialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Apply {APPLICATION_STATUS_LABELS[bulkStatus]} to {selectedCount}{" "}
							applications?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will change the status of {selectedCount} application
							{selectedCount === 1 ? "" : "s"} to{" "}
							{APPLICATION_STATUS_LABELS[bulkStatus].toLowerCase()}. Invalid
							transitions will be skipped.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={onApply}>Confirm</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
