// src/features/blog-admin/blog-bulk-action-bar.tsx
// Sticky action bar + confirmation dialog for bulk blog post operations
// (status change, delete). Extracted from post-list-page.tsx.
import { IconChecks } from "@tabler/icons-react";
import type { UseMutationResult } from "@tanstack/react-query";

type MutationLike = Pick<UseMutationResult, "isPending">;

import type { Dispatch, SetStateAction } from "react";
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

type Props = {
	selectedIds: Set<number>;
	setSelectedIds: (value: SetStateAction<Set<number>>) => void;
	bulkStatusMutation: MutationLike;
	onBulkStatus: (status: "published" | "draft" | "archived") => void;
	onBulkDelete: () => void;
	bulkDeleteOpen: boolean;
	setBulkDeleteOpen: Dispatch<SetStateAction<boolean>>;
};

export function BlogBulkActionBar({
	selectedIds,
	setSelectedIds,
	bulkStatusMutation,
	onBulkStatus,
	onBulkDelete,
	bulkDeleteOpen,
	setBulkDeleteOpen,
}: Props) {
	if (selectedIds.size === 0) return null;

	return (
		<>
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
				<div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
					<p className="text-sm font-medium">
						<IconChecks className="mr-1 inline h-4 w-4" />
						{selectedIds.size} post{selectedIds.size !== 1 ? "s" : ""} selected
					</p>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={bulkStatusMutation.isPending}
							onClick={() => void onBulkStatus("published")}
						>
							Publish
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={bulkStatusMutation.isPending}
							onClick={() => void onBulkStatus("draft")}
						>
							Unpublish
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={bulkStatusMutation.isPending}
							onClick={() => void onBulkStatus("archived")}
						>
							Archive
						</Button>
						<Button
							variant="destructive"
							size="sm"
							aria-label="Delete selected posts"
							disabled={bulkStatusMutation.isPending}
							onClick={() => setBulkDeleteOpen(true)}
						>
							Delete
						</Button>
						<Button
							variant="ghost"
							size="sm"
							aria-label="Clear selection"
							onClick={() => setSelectedIds(new Set())}
						>
							Clear
						</Button>
					</div>
				</div>
			</div>

			<AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {selectedIds.size} post{selectedIds.size !== 1 ? "s" : ""}?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This permanently removes the selected posts and their slug
							redirects. Public URLs will hard-404. This cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => void onBulkDelete()}
						>
							Delete posts
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
