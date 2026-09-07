// src/features/blog-admin/seo-panel.tsx
// Right-hand "SEO & AIO" panel of the post editor: search-snippet fields,
// keyword targeting, AI-extraction fields (takeaways + FAQ), program
// cross-links, per-post index overrides, and a live checklist.
// Sub-sections extracted to seo-panel/checklist, snippet-preview,
// takeaway-section, and faq-section.
import { IconPlus, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_PROGRAMS } from "@/data/programs";
import type { SeoCheck } from "@/lib/blog";
import { Checklist } from "./seo-panel/checklist";
import { FaqSection } from "./seo-panel/faq-section";
import { SnippetPreview } from "./seo-panel/snippet-preview";
import { TakeawaySection } from "./seo-panel/takeaway-section";
import type { PostFormState } from "./types";

type Props = {
	value: PostFormState;
	onChange: (patch: Partial<PostFormState>) => void;
	checks: SeoCheck[];
};

export function SeoPanel({ value, onChange, checks }: Props) {
	const [keywordInput, setKeywordInput] = useState("");
	const [tagInput, setTagInput] = useState("");

	function addKeyword() {
		const kw = keywordInput.trim();
		if (!kw) return;
		if (!value.seoKeywords.includes(kw)) {
			onChange({ seoKeywords: [...value.seoKeywords, kw] });
		}
		setKeywordInput("");
	}

	function addTag() {
		const tag = tagInput.trim();
		if (!tag) return;
		if (!value.tags.includes(tag)) {
			onChange({ tags: [...value.tags, tag] });
		}
		setTagInput("");
	}

	return (
		<div className="space-y-6">
			<Checklist checks={checks} />

			<SnippetPreview
				metaTitle={value.metaTitle}
				metaDescription={value.metaDescription}
				excerpt={value.excerpt}
				title={value.title}
				onChange={(patch) => onChange(patch)}
			/>

			{/* Keywords */}
			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">Keywords</h3>
				<div className="space-y-1.5">
					<Label htmlFor="focus-kw">Focus keyword</Label>
					<Input
						id="focus-kw"
						value={value.focusKeyword}
						placeholder="e.g. barber training in Dhaka"
						onChange={(e) => onChange({ focusKeyword: e.target.value })}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="seo-kws">Secondary keywords</Label>
					<div className="flex gap-2">
						<Input
							id="seo-kws"
							value={keywordInput}
							placeholder="Add keyword…"
							onChange={(e) => setKeywordInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addKeyword();
								}
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={addKeyword}
						>
							<IconPlus className="h-4 w-4" />
						</Button>
					</div>
					{value.seoKeywords.length > 0 ? (
						<ul className="flex flex-wrap gap-1.5 pt-1">
							{value.seoKeywords.map((kw) => (
								<li
									key={kw}
									className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
								>
									{kw}
									<button
										type="button"
										aria-label={`Remove ${kw}`}
										className="text-muted-foreground hover:text-destructive"
										onClick={() =>
											onChange({
												seoKeywords: value.seoKeywords.filter((k) => k !== kw),
											})
										}
									>
										<IconX className="h-3 w-3" />
									</button>
								</li>
							))}
						</ul>
					) : null}
				</div>
			</section>

			<TakeawaySection
				takeaways={value.keyTakeaways}
				onChange={(items) => onChange({ keyTakeaways: items })}
			/>

			<FaqSection
				items={value.faq}
				onChange={(items) => onChange({ faq: items })}
			/>

			{/* Program links */}
			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">Related programs</h3>
				<p className="text-xs text-muted-foreground">
					Cross-link the article to program pages to build topical clusters.
				</p>
				<ul className="max-h-44 space-y-1 overflow-y-auto rounded-md border border-border p-2">
					{ALL_PROGRAMS.map((program) => {
						const checked = value.relatedProgramSlugs.includes(program.slug);
						return (
							<li key={program.slug}>
								<label className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-xs hover:bg-muted/60">
									<input
										type="checkbox"
										checked={checked}
										onChange={() =>
											onChange({
												relatedProgramSlugs: checked
													? value.relatedProgramSlugs.filter(
															(s) => s !== program.slug,
														)
													: [...value.relatedProgramSlugs, program.slug],
											})
										}
									/>
									{program.title}
								</label>
							</li>
						);
					})}
				</ul>
			</section>

			{/* Advanced */}
			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">Advanced</h3>
				<div className="space-y-1.5">
					<Label htmlFor="canonical">Canonical URL override</Label>
					<Input
						id="canonical"
						value={value.canonicalUrl}
						placeholder="https://… (only if this content is republished elsewhere)"
						onChange={(e) => onChange({ canonicalUrl: e.target.value })}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor="og-image">Social share image URL</Label>
					<Input
						id="og-image"
						value={value.ogImageUrl}
						placeholder="Defaults to the cover image"
						onChange={(e) => onChange({ ogImageUrl: e.target.value })}
					/>
				</div>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						checked={value.noindex}
						onChange={(e) => onChange({ noindex: e.target.checked })}
					/>
					Keep this post out of search engines (noindex)
				</label>
			</section>

			{/* Tags live here too so the main form stays lean */}
			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">Tags</h3>
				<div className="flex gap-2">
					<Input
						id="post-tags"
						value={tagInput}
						placeholder="Add tag…"
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag();
							}
						}}
					/>
					<Button type="button" variant="outline" size="sm" onClick={addTag}>
						<IconPlus className="h-4 w-4" />
					</Button>
				</div>
				{value.tags.length > 0 ? (
					<ul className="flex flex-wrap gap-1.5">
						{value.tags.map((tag) => (
							<li
								key={tag}
								className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
							>
								{tag}
								<button
									type="button"
									aria-label={`Remove ${tag}`}
									className="hover:text-destructive"
									onClick={() =>
										onChange({ tags: value.tags.filter((t) => t !== tag) })
									}
								>
									<IconX className="h-3 w-3" />
								</button>
							</li>
						))}
					</ul>
				) : null}
			</section>
		</div>
	);
}
