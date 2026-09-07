// src/features/blog-admin/seo-panel/takeaway-section.tsx
// Key takeaways list for AI extraction (TL;DR box + llms.txt / structured data).
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Takeaway = { id: string; text: string };

export function TakeawaySection({
	takeaways,
	onChange,
}: {
	takeaways: Takeaway[];
	onChange: (items: Takeaway[]) => void;
}) {
	const [draft, setDraft] = useState("");

	function add() {
		const text = draft.trim();
		if (!text) return;
		onChange([...takeaways, { id: crypto.randomUUID(), text }]);
		setDraft("");
	}

	return (
		<section className="space-y-3">
			<h3 className="font-heading text-sm font-semibold">
				Key takeaways{" "}
				<span className="font-normal text-muted-foreground">
					(AI extraction)
				</span>
			</h3>
			<p className="text-xs text-muted-foreground">
				Rendered as a TL;DR box on the article and fed to llms.txt / structured
				data.
			</p>
			<ul className="space-y-2">
				{takeaways.map((row, i) => (
					<li key={row.id} className="flex items-center gap-2">
						<Input
							value={row.text}
							placeholder={`Takeaway ${i + 1}`}
							onChange={(e) => {
								onChange(
									takeaways.map((r) =>
										r.id === row.id ? { ...r, text: e.target.value } : r,
									),
								);
							}}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							aria-label="Remove takeaway"
							onClick={() => onChange(takeaways.filter((r) => r.id !== row.id))}
						>
							<IconTrash className="h-4 w-4 text-muted-foreground" />
						</Button>
					</li>
				))}
			</ul>
			<div className="flex gap-2">
				<Input
					value={draft}
					placeholder="Add a takeaway…"
					onChange={(e) => setDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							add();
						}
					}}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
					className="gap-1.5"
				>
					<IconPlus className="h-3.5 w-3.5" /> Add
				</Button>
			</div>
		</section>
	);
}
