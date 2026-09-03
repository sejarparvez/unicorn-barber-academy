// src/features/blog-admin/markdown-editor.tsx
// Split-pane markdown editor with a small formatting toolbar and live
// preview rendered through the same parse/heading pipeline as the public
// article page (lib/markdown) so previews can never drift from production
// output. The preview uses the client-safe marked-only renderer; sanitization
// happens server-side on publish.
//
// The image button uploads through /api/admin/upload and inserts standard
// markdown — stored content stays portable plain text.
import {
	IconBold,
	IconCode,
	IconDeviceFloppy,
	IconEye,
	IconH2,
	IconH3,
	IconLink,
	IconList,
	IconListNumbers,
	IconPencil,
	IconPhotoPlus,
	IconQuote,
} from "@tabler/icons-react";
import { useId, useRef, useState } from "react";
import { uploadImage } from "@/lib/api/blog-admin";
import { renderMarkdownPreview } from "@/lib/preview-markdown";
import { cn } from "@/lib/utils";

type Props = {
	value: string;
	onChange: (value: string) => void;
	slugForUploads: string;
	disabled?: boolean;
};

export function MarkdownEditor({
	value,
	onChange,
	slugForUploads,
	disabled,
}: Props) {
	const [previewing, setPreviewing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const editorId = useId();

	function wrapSelection(before: string, after = before, placeholder = "text") {
		const el = textareaRef.current;
		if (!el || disabled) return;
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const selected = value.slice(start, end) || placeholder;
		const next =
			value.slice(0, start) + before + selected + after + value.slice(end);
		onChange(next);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(
				start + before.length,
				start + before.length + selected.length,
			);
		});
	}

	function linePrefix(prefix: string) {
		const el = textareaRef.current;
		if (!el || disabled) return;
		const start = el.selectionStart;
		const lineStart = value.lastIndexOf("\n", start - 1) + 1;
		onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + prefix.length, start + prefix.length);
		});
	}

	async function insertImage(file: File) {
		if (disabled) return;
		setUploadError(null);
		setUploading(true);
		try {
			const url = await uploadImage(file, slugForUploads || "post");
			const alt = file.name.replace(/\.[a-z0-9]+$/i, "");
			wrapSelection(`![${alt}](${url})`, "", alt);
		} catch (error) {
			setUploadError(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	}

	const tools = [
		{ icon: IconH2, title: "Heading 2", run: () => linePrefix("## ") },
		{ icon: IconH3, title: "Heading 3", run: () => linePrefix("### ") },
		{ icon: IconBold, title: "Bold", run: () => wrapSelection("**") },
		{
			icon: IconQuote,
			title: "Quote",
			run: () => linePrefix("> "),
		},
		{ icon: IconList, title: "Bullet list", run: () => linePrefix("- ") },
		{
			icon: IconListNumbers,
			title: "Numbered list",
			run: () => linePrefix("1. "),
		},
		{
			icon: IconLink,
			title: "Link",
			run: () => wrapSelection("[", "](https://)", "label"),
		},
		{
			icon: IconCode,
			title: "Code block",
			run: () => wrapSelection("\n```\n", "\n```\n", "code"),
		},
	];

	return (
		<div className="rounded-lg border border-border bg-background">
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
				{tools.map((tool) => (
					<button
						key={tool.title}
						type="button"
						title={tool.title}
						onClick={tool.run}
						disabled={disabled}
						className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
					>
						<tool.icon className="h-4 w-4" stroke={1.75} />
					</button>
				))}
				<label
					className={cn(
						"flex cursor-pointer items-center rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground",
						disabled && "pointer-events-none opacity-50",
					)}
					title="Insert image"
				>
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
						className="sr-only"
						aria-label="Insert image"
						onChange={(e) => {
							const file = e.target.files?.[0];
							e.target.value = "";
							if (file) void insertImage(file);
						}}
					/>
					<IconPhotoPlus className="h-4 w-4" stroke={1.75} />
				</label>

				<span className="mx-auto" />

				<div className="flex items-center overflow-hidden rounded border border-border">
					<button
						type="button"
						onClick={() => setPreviewing(false)}
						className={cn(
							"flex items-center gap-1 px-2 py-1 text-xs font-medium",
							!previewing
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted",
						)}
					>
						<IconPencil className="h-3.5 w-3.5" /> Write
					</button>
					<button
						type="button"
						onClick={() => setPreviewing(true)}
						className={cn(
							"flex items-center gap-1 px-2 py-1 text-xs font-medium",
							previewing
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted",
						)}
					>
						<IconEye className="h-3.5 w-3.5" /> Preview
					</button>
				</div>
			</div>

			{uploadError ? (
				<p className="border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
					{uploadError}
				</p>
			) : null}
			{uploading ? (
				<p className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
					<IconDeviceFloppy className="h-3.5 w-3.5 animate-pulse" />
					Uploading image…
				</p>
			) : null}

			{previewing ? (
				// Preview uses the same parse/heading pipeline as the server
				// renderer (see lib/markdown) so it matches production output.
				// It is NOT sanitized client-side — sanitization happens on the
				// server when content is published, and this is a draft preview.
				<div
					className="prose prose-sm dark:prose-invert min-h-[420px] max-w-none px-4 py-4"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: draft preview for the admin editor only
					dangerouslySetInnerHTML={{
						__html: renderMarkdownPreview(value || "*Nothing to preview yet.*"),
					}}
				/>
			) : (
				<textarea
					id={editorId}
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					disabled={disabled}
					aria-label="Article body (markdown)"
					placeholder={"## Section heading\n\nWrite in markdown…"}
					spellCheck
					className="min-h-[420px] w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
				/>
			)}

			<div className="flex items-center justify-between border-t border-border px-3 py-1.5 text-[11px] text-muted-foreground">
				<span>{value.trim().split(/\s+/).filter(Boolean).length} words</span>
				<span>Markdown supported · images upload automatically</span>
			</div>
		</div>
	);
}
