// Split-pane Markdown editor for the blog admin. The preview uses the same
// client-safe marked pipeline as production, but is rendered only for the
// signed-in admin; the public page re-renders and sanitizes server-side.
import {
	IconBold,
	IconCode,
	IconColumns2,
	IconEye,
	IconH2,
	IconH3,
	IconItalic,
	IconLink,
	IconList,
	IconListNumbers,
	IconLoader2,
	IconPencil,
	IconPhoto,
	IconQuote,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { renderMarkdownPreview } from './markdown-preview';
import { useImageUpload } from './use-image-upload';

type ViewMode = 'write' | 'split' | 'preview';

const VIEW_MODES: { mode: ViewMode; label: string; icon: typeof IconEye }[] = [
	{ mode: 'write', label: 'Write', icon: IconPencil },
	{ mode: 'split', label: 'Split', icon: IconColumns2 },
	{ mode: 'preview', label: 'Preview', icon: IconEye },
];

export function MarkdownEditor({
	value,
	onChange,
	disabled,
	id,
}: {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	id?: string;
}) {
	const [viewMode, setViewMode] = useState<ViewMode>('write');
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const { upload, uploading, error } = useImageUpload();

	function wrapSelection(before: string, after = before, placeholder = 'text') {
		const el = textareaRef.current;
		if (!el || disabled) {
			return;
		}
		const { selectionStart: start, selectionEnd: end } = el;
		const selected = value.slice(start, end) || placeholder;
		onChange(
			value.slice(0, start) + before + selected + after + value.slice(end),
		);
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
		if (!el || disabled) {
			return;
		}
		const start = el.selectionStart;
		const lineStart = value.lastIndexOf('\n', start - 1) + 1;
		onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart));
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(start + prefix.length, start + prefix.length);
		});
	}

	async function onImageFile(file: File) {
		const el = textareaRef.current;
		const start = el?.selectionStart ?? value.length;
		const end = el?.selectionEnd ?? start;
		const selected = value.slice(start, end).trim();
		const fileName = file.name
			.replace(/\.[^.]+$/, '')
			.replace(/[-_]+/g, ' ')
			.trim();
		const alt = (selected || fileName || 'Image')
			.replace(/[[\]\n\r]+/g, ' ')
			.trim();

		const url = await upload(file);
		if (!url) {
			return;
		}

		const snippet = `![${alt || 'Image'}](${url})`;
		onChange(value.slice(0, start) + snippet + value.slice(end));
		requestAnimationFrame(() => {
			el?.focus();
			const cursor = start + snippet.length;
			el?.setSelectionRange(cursor, cursor);
		});
	}

	const tools = [
		{ icon: IconH2, title: 'Heading 2', run: () => linePrefix('## ') },
		{ icon: IconH3, title: 'Heading 3', run: () => linePrefix('### ') },
		{ icon: IconBold, title: 'Bold', run: () => wrapSelection('**') },
		{ icon: IconItalic, title: 'Italic', run: () => wrapSelection('_') },
		{ icon: IconQuote, title: 'Quote', run: () => linePrefix('> ') },
		{ icon: IconList, title: 'Bullet list', run: () => linePrefix('- ') },
		{
			icon: IconListNumbers,
			title: 'Numbered list',
			run: () => linePrefix('1. '),
		},
		{
			icon: IconLink,
			title: 'Link',
			run: () => wrapSelection('[', '](https://)', 'label'),
		},
		{
			icon: IconCode,
			title: 'Code block',
			run: () => wrapSelection('\n```\n', '\n```\n', 'code'),
		},
		{
			icon: IconPhoto,
			title: 'Upload image',
			run: () => imageInputRef.current?.click(),
		},
	];

	const previewHtml = renderMarkdownPreview(
		value || '*Nothing to preview yet.*',
	);
	const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

	return (
		<div className="overflow-hidden rounded-xl border border-border bg-background">
			<input
				ref={imageInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/avif"
				className="sr-only"
				tabIndex={-1}
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = '';
					if (file) {
						void onImageFile(file);
					}
				}}
			/>

			<div className="flex flex-wrap items-center gap-1 border-border border-b px-2 py-1.5">
				{tools.map((tool) => (
					<Button
						key={tool.title}
						type="button"
						variant="ghost"
						size="icon-sm"
						title={tool.title}
						aria-label={tool.title}
						onClick={tool.run}
						disabled={disabled || uploading}
					>
						{tool.title === 'Upload image' && uploading ? (
							<IconLoader2 className="animate-spin" stroke={1.75} />
						) : (
							<tool.icon stroke={1.75} />
						)}
					</Button>
				))}

				<span className="mx-auto" />

				<div className="flex items-center overflow-hidden rounded-md border border-border">
					{VIEW_MODES.map((item) => (
						<button
							key={item.mode}
							type="button"
							onClick={() => setViewMode(item.mode)}
							aria-pressed={viewMode === item.mode}
							className={cn(
								'flex items-center gap-1 px-2 py-1 font-medium text-xs transition-colors',
								viewMode === item.mode
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:bg-muted',
							)}
						>
							<item.icon className="size-3.5" stroke={1.75} />
							{item.label}
						</button>
					))}
				</div>
			</div>

			{error ? (
				<p
					role="alert"
					className="border-destructive/30 border-b bg-destructive/10 px-3 py-1.5 text-destructive text-xs"
				>
					{error}
				</p>
			) : null}

			{viewMode === 'split' ? (
				<div className="flex min-h-[420px]">
					<EditorTextarea
						id={id}
						textareaRef={textareaRef}
						value={value}
						onChange={onChange}
						disabled={disabled || uploading}
						className="w-1/2 resize-y border-border border-r"
					/>
					<div
						className="article-body w-1/2 overflow-y-auto px-4 py-4"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: admin-only preview; public output is sanitized server-side
						dangerouslySetInnerHTML={{ __html: previewHtml }}
					/>
				</div>
			) : viewMode === 'preview' ? (
				<div
					className="article-body min-h-[420px] px-4 py-4"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: admin-only preview; public output is sanitized server-side
					dangerouslySetInnerHTML={{ __html: previewHtml }}
				/>
			) : (
				<EditorTextarea
					id={id}
					textareaRef={textareaRef}
					value={value}
					onChange={onChange}
					disabled={disabled || uploading}
					className="min-h-[420px] w-full resize-y"
				/>
			)}

			<div className="flex items-center justify-between border-border border-t px-3 py-1.5 text-[11px] text-muted-foreground">
				<span>{wordCount} words</span>
				<span>Markdown supported</span>
			</div>
		</div>
	);
}

function EditorTextarea({
	id,
	textareaRef,
	value,
	onChange,
	disabled,
	className,
}: {
	id?: string;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	className?: string;
}) {
	return (
		<textarea
			id={id}
			ref={textareaRef}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			disabled={disabled}
			aria-label="Article body (Markdown)"
			placeholder={'## Section heading\n\nWrite in Markdown…'}
			spellCheck
			className={cn(
				'bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60',
				className,
			)}
		/>
	);
}
