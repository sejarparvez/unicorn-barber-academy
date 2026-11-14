import {
	IconCheck,
	IconLink,
	IconLoader2,
	IconPhoto,
	IconTrash,
	IconUpload,
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useImageUpload } from './use-image-upload';

type SourceMode = 'upload' | 'url';

const SOURCE_MODES: {
	mode: SourceMode;
	label: string;
	icon: typeof IconUpload;
}[] = [
	{ mode: 'upload', label: 'Upload', icon: IconUpload },
	{ mode: 'url', label: 'Image URL', icon: IconLink },
];

type UrlResult = { ok: true; url: string } | { ok: false; error: string };

function normaliseImageUrl(value: string): UrlResult {
	const trimmed = value.trim();

	if (!trimmed) {
		return { ok: false, error: 'Paste an image URL first.' };
	}

	let parsed: URL;
	try {
		parsed = new URL(trimmed);
	} catch {
		return {
			ok: false,
			error: 'Enter a valid URL, for example https://example.com/cover.jpg',
		};
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return { ok: false, error: 'The URL must start with http:// or https://.' };
	}

	return { ok: true, url: trimmed };
}

export function CoverImageUpload({
	value,
	onChange,
	disabled,
}: {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { upload, uploading, error } = useImageUpload();
	const [mode, setMode] = useState<SourceMode>('upload');
	const [urlDraft, setUrlDraft] = useState(value);
	const [urlError, setUrlError] = useState<string | null>(null);
	const [previewBroken, setPreviewBroken] = useState(false);

	function selectImage(next: string) {
		setPreviewBroken(false);
		onChange(next);
	}

	async function onFile(file: File) {
		const url = await upload(file);
		if (url) {
			selectImage(url);
		}
	}

	function applyUrl() {
		const result = normaliseImageUrl(urlDraft);

		if (!result.ok) {
			setUrlError(result.error);
			return;
		}

		setUrlError(null);
		selectImage(result.url);
	}

	const hasImage = value.trim().length > 0;
	const message = urlError ?? error;

	return (
		<div className="flex flex-col gap-3">
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/avif"
				className="sr-only"
				tabIndex={-1}
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = '';
					if (file) {
						void onFile(file);
					}
				}}
			/>

			<div className="relative overflow-hidden rounded-xl border border-border bg-muted/20">
				{hasImage && !previewBroken ? (
					<img
						src={value}
						alt=""
						className="aspect-16/9 w-full object-cover"
						onError={() => setPreviewBroken(true)}
					/>
				) : (
					<div className="flex aspect-16/9 w-full flex-col items-center justify-center gap-2 border border-border border-dashed text-muted-foreground">
						<IconPhoto className="size-8" stroke={1.5} aria-hidden />
						<p className="px-6 text-center text-xs">
							{previewBroken
								? 'This image could not be loaded. Check the URL and try again.'
								: 'No cover image yet'}
						</p>
					</div>
				)}

				{hasImage ? (
					<Button
						type="button"
						variant="outline"
						size="icon-sm"
						title="Remove cover image"
						aria-label="Remove cover image"
						className="absolute top-2 right-2 bg-background/90 backdrop-blur"
						disabled={disabled || uploading}
						onClick={() => {
							selectImage('');
							setUrlDraft('');
							setUrlError(null);
						}}
					>
						<IconTrash stroke={1.75} />
					</Button>
				) : null}
			</div>

			<div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1">
				{SOURCE_MODES.map((item) => (
					<button
						key={item.mode}
						type="button"
						onClick={() => setMode(item.mode)}
						aria-pressed={mode === item.mode}
						className={cn(
							'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-xs transition-colors',
							mode === item.mode
								? 'bg-background text-foreground shadow-xs'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						<item.icon className="size-3.5" stroke={1.75} aria-hidden />
						{item.label}
					</button>
				))}
			</div>

			{mode === 'upload' ? (
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="w-full"
					disabled={disabled || uploading}
					onClick={() => inputRef.current?.click()}
				>
					{uploading ? (
						<IconLoader2 className="animate-spin" stroke={1.75} />
					) : (
						<IconUpload stroke={1.75} />
					)}
					{uploading
						? 'Uploading…'
						: hasImage
							? 'Replace with an upload'
							: 'Choose an image'}
				</Button>
			) : (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<Input
							type="url"
							inputMode="url"
							value={urlDraft}
							placeholder="https://example.com/cover.jpg"
							aria-label="Cover image URL"
							aria-invalid={!!urlError}
							disabled={disabled || uploading}
							onChange={(event) => {
								setUrlDraft(event.target.value);
								if (urlError) {
									setUrlError(null);
								}
							}}
							onKeyDown={(event) => {
								if (event.key === 'Enter') {
									event.preventDefault();
									applyUrl();
								}
							}}
						/>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={disabled || uploading}
							onClick={applyUrl}
						>
							<IconCheck stroke={1.75} />
							Use
						</Button>
					</div>
					<p className="text-muted-foreground text-xs">
						Paste a direct link to a JPEG, PNG, WebP or AVIF image.
					</p>
				</div>
			)}

			{message ? (
				<p role="alert" className="text-destructive text-xs">
					{message}
				</p>
			) : null}
		</div>
	);
}
