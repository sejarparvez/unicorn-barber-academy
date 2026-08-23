// src/features/blog-admin/seo-panel.tsx
// Right-hand "SEO & AIO" panel of the post editor: search-snippet fields,
// keyword targeting, AI-extraction fields (takeaways + FAQ), program
// cross-links, per-post index overrides, and a live checklist.
import { IconCheck, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALL_PROGRAMS } from "@/data/programs";
import type { FaqItem, SeoCheck } from "@/lib/blog";
import { cn } from "@/lib/utils";
import type { PostFormState } from "./types";

type Props = {
	value: PostFormState;
	onChange: (patch: Partial<PostFormState>) => void;
	checks: SeoCheck[];
};

const LEVEL_STYLE: Record<SeoCheck["level"], string> = {
	good: "text-emerald-600 dark:text-emerald-400",
	warn: "text-amber-600 dark:text-amber-400",
	bad: "text-destructive",
};

export function SeoPanel({ value, onChange, checks }: Props) {
	const [keywordInput, setKeywordInput] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [faqDraft, setFaqDraft] = useState<FaqItem>({ q: "", a: "" });
	const [takeawayDraft, setTakeawayDraft] = useState("");

	const titleLen = (value.metaTitle || value.title || "").length;
	const descLen = (value.metaDescription || value.excerpt || "").length;

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

	function addTakeaway() {
		const text = takeawayDraft.trim();
		if (!text) return;
		onChange({
			keyTakeaways: [...value.keyTakeaways, { id: crypto.randomUUID(), text }],
		});
		setTakeawayDraft("");
	}

	function addFaq() {
		if (!faqDraft.q.trim() || !faqDraft.a.trim()) return;
		onChange({
			faq: [
				...value.faq,
				{
					id: crypto.randomUUID(),
					q: faqDraft.q.trim(),
					a: faqDraft.a.trim(),
				},
			],
		});
		setFaqDraft({ q: "", a: "" });
	}

	return (
		<div className="space-y-6">
			{/* Live checklist */}
			<section className="rounded-lg border border-border bg-muted/30 p-4">
				<h3 className="font-heading text-sm font-semibold">
					Optimization checklist
				</h3>
				<ul className="mt-3 space-y-1.5">
					{checks.map((check) => (
						<li
							key={check.label}
							className={cn(
								"flex items-start gap-2 text-xs",
								LEVEL_STYLE[check.level],
							)}
						>
							{check.level === "good" ? (
								<IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							) : check.level === "warn" ? (
								<span className="mt-0.5 shrink-0 font-bold">!</span>
							) : (
								<IconX className="mt-0.5 h-3.5 w-3.5 shrink-0" />
							)}
							{check.label}
						</li>
					))}
				</ul>
			</section>

			{/* Search snippet */}
			<section className="space-y-4">
				<h3 className="font-heading text-sm font-semibold">Search snippet</h3>
				<div className="space-y-1.5">
					<Label htmlFor="meta-title">SEO title override</Label>
					<Input
						id="meta-title"
						value={value.metaTitle}
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
						value={value.metaDescription}
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

			{/* AIO: takeaways + FAQ */}
			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">
					Key takeaways{" "}
					<span className="font-normal text-muted-foreground">
						(AI extraction)
					</span>
				</h3>
				<p className="text-xs text-muted-foreground">
					Rendered as a TL;DR box on the article and fed to llms.txt /
					structured data.
				</p>
				<ul className="space-y-2">
					{value.keyTakeaways.map((row, i) => (
						<li key={row.id} className="flex items-center gap-2">
							<Input
								value={row.text}
								placeholder={`Takeaway ${i + 1}`}
								onChange={(e) => {
									onChange({
										keyTakeaways: value.keyTakeaways.map((r) =>
											r.id === row.id ? { ...r, text: e.target.value } : r,
										),
									});
								}}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								aria-label="Remove takeaway"
								onClick={() =>
									onChange({
										keyTakeaways: value.keyTakeaways.filter(
											(r) => r.id !== row.id,
										),
									})
								}
							>
								<IconTrash className="h-4 w-4 text-muted-foreground" />
							</Button>
						</li>
					))}
				</ul>
				<div className="flex gap-2">
					<Input
						value={takeawayDraft}
						placeholder="Add a takeaway…"
						onChange={(e) => setTakeawayDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTakeaway();
							}
						}}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addTakeaway}
						className="gap-1.5"
					>
						<IconPlus className="h-3.5 w-3.5" /> Add
					</Button>
				</div>
			</section>

			<section className="space-y-3">
				<h3 className="font-heading text-sm font-semibold">
					FAQ{" "}
					<span className="font-normal text-muted-foreground">
						(answer engines)
					</span>
				</h3>
				{value.faq.length > 0 ? (
					<ul className="space-y-2">
						{value.faq.map((item) => (
							<li
								key={item.id}
								className="rounded-md border border-border p-2.5"
							>
								<div className="flex items-start justify-between gap-2">
									<p className="text-xs font-medium">{item.q}</p>
									<button
										type="button"
										aria-label="Remove FAQ"
										className="text-muted-foreground hover:text-destructive"
										onClick={() =>
											onChange({
												faq: value.faq.filter((f) => f.id !== item.id),
											})
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
						value={faqDraft.q}
						placeholder="Question"
						onChange={(e) => setFaqDraft({ ...faqDraft, q: e.target.value })}
					/>
					<Textarea
						rows={2}
						value={faqDraft.a}
						placeholder="Answer"
						onChange={(e) => setFaqDraft({ ...faqDraft, a: e.target.value })}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addFaq}
						className="gap-1.5"
					>
						<IconPlus className="h-3.5 w-3.5" /> Add FAQ
					</Button>
				</div>
			</section>

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
