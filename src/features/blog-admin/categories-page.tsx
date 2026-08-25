// src/features/blog-admin/categories-page.tsx
// Minimal category manager: create, rename inline, delete. Deleting a
// category never deletes posts (ON DELETE SET NULL in the schema).
// Reads + mutations flow through the service layer.
import {
	IconArrowLeft,
	IconCheck,
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	useBlogCategories,
	useCreateCategory,
	useDeleteCategory,
	useRenameCategory,
} from "@/service/blog";

export function CategoriesPage() {
	const { data: categories = [] } = useBlogCategories();
	const createMutation = useCreateCategory();
	const renameMutation = useRenameCategory();
	const deleteMutation = useDeleteCategory();

	const [newName, setNewName] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editValue, setEditValue] = useState("");
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);
	const busy =
		createMutation.isPending ||
		renameMutation.isPending ||
		deleteMutation.isPending;

	async function onAdd() {
		if (!newName.trim() || busy) return;
		setError(null);
		try {
			await createMutation.mutateAsync(newName.trim());
			setNewName("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Create failed");
		}
	}

	async function onRename(id: number) {
		if (!editValue.trim() || busy) return;
		setError(null);
		try {
			await renameMutation.mutateAsync({ id, name: editValue.trim() });
			setEditingId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Rename failed");
		}
	}

	async function onDelete(id: number) {
		if (busy) return;
		if (confirmDeleteId !== id) {
			setConfirmDeleteId(id);
			return;
		}
		setError(null);
		try {
			await deleteMutation.mutateAsync(id);
			setConfirmDeleteId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	}

	return (
		<div className="space-y-6">
			<header className="flex items-center gap-3">
				<Link
					to="/dashboard/blog"
					aria-label="Back to posts"
					className={cn(
						buttonVariants({ variant: "ghost", size: "icon" }),
						"text-muted-foreground",
					)}
				>
					<IconArrowLeft className="h-4 w-4" />
				</Link>
				<div>
					<p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
						Staff tools
					</p>
					<h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight">
						Blog categories
					</h1>
				</div>
			</header>

			{error ? (
				<p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			) : null}

			<div className="flex gap-2">
				<Input
					value={newName}
					placeholder="New category name…"
					aria-label="New category name"
					onChange={(e) => setNewName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && void onAdd()}
				/>
				<Button
					onClick={onAdd}
					disabled={busy || !newName.trim()}
					className="gap-1.5"
				>
					<IconPlus className="h-4 w-4" /> Add
				</Button>
			</div>

			<ul className="divide-y divide-border rounded-xl border border-border bg-card">
				{categories.length === 0 ? (
					<li className="p-8 text-center text-sm text-muted-foreground">
						No categories yet.
					</li>
				) : (
					categories.map((category) => (
						<li key={category.id} className="flex items-center gap-2 p-3">
							{editingId === category.id ? (
								<>
									<Input
										value={editValue}
										autoFocus
										onChange={(e) => setEditValue(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") void onRename(category.id);
											if (e.key === "Escape") setEditingId(null);
										}}
									/>
									<Button
										variant="outline"
										size="icon"
										aria-label="Save name"
										disabled={busy}
										onClick={() => onRename(category.id)}
									>
										<IconCheck className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Cancel rename"
										className="text-muted-foreground"
										disabled={busy}
										onClick={() => setEditingId(null)}
									>
										<IconX className="h-4 w-4" />
									</Button>
								</>
							) : (
								<>
									<button
										type="button"
										className="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left font-medium hover:bg-muted"
										onClick={() => {
											setEditingId(category.id);
											setEditValue(category.name);
										}}
										title="Click to rename"
									>
										{category.name}
									</button>
									<span className="text-xs text-muted-foreground">
										/{category.slug}
									</span>
									<Button
										variant="ghost"
										size="icon"
										aria-label={
											confirmDeleteId === category.id
												? `Confirm delete ${category.name}`
												: `Delete ${category.name}`
										}
										className={cn(
											"text-muted-foreground hover:text-destructive",
											confirmDeleteId === category.id &&
												"bg-destructive/10 text-destructive",
										)}
										disabled={busy}
										onClick={() => {
											void onDelete(category.id);
										}}
									>
										<IconTrash className="h-4 w-4" />
									</Button>
								</>
							)}
						</li>
					))
				)}
			</ul>
			<p className="text-xs text-muted-foreground">
				Deleting a category keeps its posts — they just become uncategorized.
				The delete button asks for a second click to confirm.
			</p>
		</div>
	);
}
