// src/features/blog-admin/seo-panel/faq-section.tsx
// FAQ list for answer-engine optimization (FAQ structured data on the post page).
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FaqItem = { id: string; q: string; a: string };

export function FaqSection({
	items,
	onChange,
}: {
	items: FaqItem[];
	onChange: (items: FaqItem[]) => void;
}) {
	const [draft, setDraft] = useState<{ q: string; a: string }>({
		q: "",
		a: "",
	});

	function add() {
		if (!draft.q.trim() || !draft.a.trim()) return;
		onChange([
			...items,
			{
				id: crypto.randomUUID(),
				q: draft.q.trim(),
				a: draft.a.trim(),
			},
		]);
		setDraft({ q: "", a: "" });
	}

	return (
		<section className="space-y-3">
			<h3 className="font-heading text-sm font-semibold">
				FAQ{" "}
				<span className="font-normal text-muted-foreground">
					(answer engines)
				</span>
			</h3>
			{items.length > 0 ? (
				<ul className="space-y-2">
					{items.map((item) => (
						<li key={item.id} className="rounded-md border border-border p-2.5">
							<div className="flex items-start justify-between gap-2">
								<p className="text-xs font-medium">{item.q}</p>
								<button
									type="button"
									aria-label="Remove FAQ"
									className="text-muted-foreground hover:text-destructive"
									onClick={() =>
										onChange(items.filter((f) => f.id !== item.id))
									}
								>
									<IconTrash className="h-3.5 w-3.5" />
								</button>
							</div>
							<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
								{item.a}
							</p>
						</li>
					))}
				</ul>
			) : null}
			<div className="space-y-2 rounded-md border border-dashed border-border p-2.5">
				<Input
					value={draft.q}
					placeholder="Question"
					onChange={(e) => setDraft({ ...draft, q: e.target.value })}
				/>
				<Textarea
					rows={2}
					value={draft.a}
					placeholder="Answer"
					onChange={(e) => setDraft({ ...draft, a: e.target.value })}
				/>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={add}
					className="gap-1.5"
				>
					<IconPlus className="h-3.5 w-3.5" /> Add FAQ
				</Button>
			</div>
		</section>
	);
}
