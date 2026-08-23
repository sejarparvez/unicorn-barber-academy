// src/features/blog-admin/categories-page.tsx
// Minimal category manager: create, rename inline, delete. Deleting a
// category never deletes posts (ON DELETE SET NULL in the schema).
import {
	IconArrowLeft,
	IconCheck,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	createCategory,
	deleteCategory,
	renameCategory,
} from "@/lib/api/blog-admin";
import type { BlogCategory } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function CategoriesPage({ categories }: { categories: BlogCategory[] }) {
	const [items, setItems] = useState(categories);
	const [newName, setNewName] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editValue, setEditValue] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	async function onAdd() {
		if (!newName.trim() || busy) return;
		setBusy(true);
		setError(null);
		try {
			const category = await createCategory(newName.trim());
			setItems((prev) =>
				[...prev, category].sort((a, b) => a.name.localeCompare(b.name)),
			);
			setNewName("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Create failed");
		} finally {
			setBusy(false);
		}
	}

	async function onRename(id: number) {
		if (!editValue.trim() || busy) return;
		setBusy(true);
		setError(null);
		try {
			await renameCategory(id, editValue.trim());
			setItems((prev) =>
				prev.map((c) => (c.id === id ? { ...c, name: editValue.trim() } : c)),
			);
			setEditingId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Rename failed");
		} finally {
			setBusy(false);
		}
	}

	async function onDelete(id: number) {
		if (busy) return;
		setBusy(true);
		setError(null);
		try {
			await deleteCategory(id);
			setItems((prev) => prev.filter((c) => c.id !== id));
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		} finally {
			setBusy(false);
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
				{items.length === 0 ? (
					<li className="p-8 text-center text-sm text-muted-foreground">
						No categories yet.
					</li>
				) : (
					items.map((category) => (
						<li key={category.id} className="flex items-center gap-2 p-3">
							{editingId === category.id ? (
								<>
									<Input
										value={editValue}
										autoFocus
										onChange={(e) => setEditValue(e.target.value)}
										onKeyDown={(e) =>
											e.key === "Enter" && void onRename(category.id)
										}
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
										aria-label={`Delete ${category.name}`}
										className="text-muted-foreground hover:text-destructive"
										disabled={busy}
										onClick={() => onDelete(category.id)}
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
			</p>
		</div>
	);
}
