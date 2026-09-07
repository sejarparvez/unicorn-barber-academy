// src/features/blog-admin/seo-panel/snippet-preview.tsx
// Google search snippet preview with title and description character counters.
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function SnippetPreview({
	metaTitle,
	metaDescription,
	excerpt,
	title,
	onChange,
}: {
	metaTitle: string;
	metaDescription: string;
	excerpt: string;
	title: string;
	onChange: (patch: { metaTitle?: string; metaDescription?: string }) => void;
}) {
	const titleLen = (metaTitle || title || "").length;
	const descLen = (metaDescription || excerpt || "").length;

	return (
		<section className="space-y-4">
			<h3 className="font-heading text-sm font-semibold">Search snippet</h3>
			<div className="space-y-1.5">
				<Label htmlFor="meta-title">SEO title override</Label>
				<Input
					id="meta-title"
					value={metaTitle}
					maxLength={200}
					placeholder="Defaults to the post title"
					onChange={(e) => onChange({ metaTitle: e.target.value })}
				/>
				<p
					className={cn(
						"text-[11px]",
						titleLen > 60 ? "text-destructive" : "text-muted-foreground",
					)}
				>
					{titleLen}/60 characters
				</p>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor="meta-desc">Meta description</Label>
				<Textarea
					id="meta-desc"
					rows={3}
					value={metaDescription}
					maxLength={400}
					placeholder="Defaults to the excerpt"
					onChange={(e) => onChange({ metaDescription: e.target.value })}
				/>
				<p
					className={cn(
						"text-[11px]",
						descLen > 160 || (descLen > 0 && descLen < 50)
							? "text-amber-600 dark:text-amber-400"
							: "text-muted-foreground",
					)}
				>
					{descLen}/160 characters
				</p>
			</div>
		</section>
	);
}
